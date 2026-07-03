"""Rewind backend — FastAPI over cognee 1.2.2."""

from typing import Optional

import env_setup  # noqa: F401  (must run before cognee import)

import cognee
from cognee import SearchType
from cognee.modules.engine.models.node_set import NodeSet
from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import ingest
from graph import extract_context_chunks, get_graph_snapshot, resolve_provenance

app = FastAPI(title="Rewind")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class IngestRequest(BaseModel):
    repo: str
    filter: Optional[str] = None
    batch_label: str
    limit: int = 40


class AskRequest(BaseModel):
    question: str
    batch_cutoff: Optional[str] = None


@app.post("/ingest")
async def start_ingest(req: IngestRequest, background: BackgroundTasks):
    if ingest.status["state"] in {"fetching", "adding", "cognifying"}:
        return {"ok": False, "error": "ingest already running", "status": ingest.status}
    background.add_task(ingest.run_ingest, req.repo, req.filter, req.batch_label, req.limit)
    return {"ok": True, "batch_label": req.batch_label}


@app.get("/ingest/status")
async def ingest_status():
    return ingest.status


@app.get("/graph")
async def graph():
    return await get_graph_snapshot()


@app.get("/batches")
async def batches():
    return {"batches": ingest.load_batches()}


@app.post("/reset")
async def reset():
    await cognee.prune.prune_data()
    await cognee.prune.prune_system(metadata=True)
    ingest.BATCHES_FILE.unlink(missing_ok=True)
    ingest.status = {"state": "idle", "batch_label": None, "detail": "", "docs": 0}
    return {"ok": True}


@app.post("/ask")
async def ask(req: AskRequest):
    # Time travel: batch labels are NodeSet names; a cutoff scopes search to the
    # node sets of all batches up to and including the cutoff.
    node_names = None
    if req.batch_cutoff:
        labels = [b["label"] for b in ingest.load_batches()]
        if req.batch_cutoff in labels:
            node_names = labels[: labels.index(req.batch_cutoff) + 1]

    results = await cognee.search(
        query_text=req.question,
        query_type=SearchType.GRAPH_COMPLETION,
        datasets=[ingest.DATASET],
        node_type=NodeSet,
        node_name=node_names,
        verbose=True,
    )

    answer, context_result, objects_result = "", None, None
    if results:
        first = results[0] if isinstance(results, list) else results
        if isinstance(first, dict):
            answer = str(first.get("text_result") or "")
            context_result = first.get("context_result")
            objects_result = first.get("objects_result")
        else:
            answer = str(first)

    snapshot = await get_graph_snapshot()
    context_text = context_result if isinstance(context_result, str) else str(context_result or "")
    node_ids, edges = resolve_provenance(snapshot, objects_result, context_text)

    return {
        "answer": answer,
        "retrieved_node_ids": node_ids,
        "retrieved_edges": edges,
        "context_chunks": extract_context_chunks(context_result, objects_result),
        "batch_cutoff": req.batch_cutoff,
        "scoped_to_batches": node_names,
    }
