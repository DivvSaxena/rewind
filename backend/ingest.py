"""GitHub issues/PRs -> markdown docs -> cognee add() + cognify(), tagged by batch."""

import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import httpx

import env_setup  # noqa: F401  (must run before cognee import)
import cognee

BATCHES_FILE = Path(__file__).parent / "batches.json"
DATASET = "rewind"

# In-process ingest status for GET /ingest/status
status: dict = {"state": "idle", "batch_label": None, "detail": "", "docs": 0}


def load_batches() -> list[dict]:
    if BATCHES_FILE.exists():
        return json.loads(BATCHES_FILE.read_text())
    return []


def save_batch(label: str, doc_count: int) -> None:
    batches = load_batches()
    batches = [b for b in batches if b["label"] != label]
    batches.append(
        {
            "label": label,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "doc_count": doc_count,
        }
    )
    BATCHES_FILE.write_text(json.dumps(batches, indent=2))


async def fetch_github_docs(repo: str, filter_: str | None, limit: int = 40) -> list[str]:
    """Fetch issues + PRs (with discussion) as markdown docs, oldest first."""
    headers = {"Accept": "application/vnd.github+json"}
    if os.getenv("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"

    docs = []
    async with httpx.AsyncClient(headers=headers, timeout=30) as client:
        page = 1
        while len(docs) < limit:
            resp = await client.get(
                f"https://api.github.com/repos/{repo}/issues",
                params={
                    "state": "all",
                    "sort": "created",
                    "direction": "asc",
                    "per_page": 50,
                    "page": page,
                },
            )
            resp.raise_for_status()
            items = resp.json()
            if not items:
                break
            for item in items:
                if len(docs) >= limit:
                    break
                if filter_ and filter_.lower() not in (item["title"] + str(item.get("labels"))).lower():
                    continue
                kind = "PR" if "pull_request" in item else "Issue"
                body = (item.get("body") or "")[:4000]
                comments_md = ""
                if item.get("comments", 0) > 0:
                    c_resp = await client.get(item["comments_url"], params={"per_page": 10})
                    if c_resp.status_code == 200:
                        comments_md = "\n".join(
                            f"- **{c['user']['login']}**: {(c.get('body') or '')[:800]}"
                            for c in c_resp.json()
                        )
                docs.append(
                    f"# {kind} #{item['number']}: {item['title']}\n\n"
                    f"- number: {item['number']}\n"
                    f"- type: {kind}\n"
                    f"- date: {item['created_at']}\n"
                    f"- author: {item['user']['login']}\n"
                    f"- url: {item['html_url']}\n\n"
                    f"## Description\n{body}\n\n"
                    + (f"## Discussion\n{comments_md}\n" if comments_md else "")
                )
            page += 1
    return docs


async def cognify_with_backoff(max_attempts: int = 4) -> None:
    """cognify with retry on Groq 429s: exponential backoff + shrinking batch size.

    Never switches providers; re-raises after max_attempts.
    """
    delay, chunks_per_batch = 30, None
    for attempt in range(1, max_attempts + 1):
        try:
            kwargs = {"chunks_per_batch": chunks_per_batch} if chunks_per_batch else {}
            await cognee.cognify(datasets=[DATASET], **kwargs)
            return
        except Exception as exc:
            msg = str(exc).lower()
            rate_limited = "429" in msg or "rate limit" in msg or "rate_limit" in msg
            if not rate_limited or attempt == max_attempts:
                raise
            status["detail"] = f"Groq 429, retry {attempt}/{max_attempts - 1} in {delay}s"
            await asyncio.sleep(delay)
            delay *= 2
            chunks_per_batch = max(1, (chunks_per_batch or 8) // 2)


async def run_ingest(repo: str, filter_: str | None, batch_label: str, limit: int = 40) -> None:
    global status
    try:
        status = {"state": "fetching", "batch_label": batch_label, "detail": f"fetching {repo}", "docs": 0}
        docs = await fetch_github_docs(repo, filter_, limit)
        status = {"state": "adding", "batch_label": batch_label, "detail": f"{len(docs)} docs", "docs": len(docs)}
        # node_set tags every extracted node with the batch label (native batch tracking);
        # batches.json sidecar keeps chronological batch order + timestamps.
        await cognee.add(docs, dataset_name=DATASET, node_set=[batch_label])
        status = {"state": "cognifying", "batch_label": batch_label, "detail": "extracting graph (minutes)", "docs": len(docs)}
        await cognify_with_backoff()
        save_batch(batch_label, len(docs))
        status = {"state": "done", "batch_label": batch_label, "detail": "complete", "docs": len(docs)}
    except Exception as exc:  # surfaced via /ingest/status
        status = {"state": "error", "batch_label": batch_label, "detail": str(exc)[:500], "docs": 0}


async def ingest_texts(texts: list[str], batch_label: str) -> None:
    """Direct text ingest (used by smoke test)."""
    await cognee.add(texts, dataset_name=DATASET, node_set=[batch_label])
    await cognify_with_backoff()
    save_batch(batch_label, len(texts))


if __name__ == "__main__":
    import sys

    asyncio.run(run_ingest(sys.argv[1], None, sys.argv[2]))
