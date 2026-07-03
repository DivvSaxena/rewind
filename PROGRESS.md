# Rewind — Progress

## Current phase
**Phase 1 (cognee loop proof): code complete, smoke test NOT yet run — blocked on API keys.**
Run `backend/.venv/bin/python backend/smoke.py` once keys are in `backend/.env` (see `.env.example`), then verify output and gate.

## Confirmed cognee facts (v1.2.2, inspected from package source)
- Python 3.11 venv at `backend/.venv`. Deps: cognee 1.2.2, fastapi, uvicorn, httpx.
- Default graph store: **ladybug** (embedded; `GRAPH_DATABASE_PROVIDER` env).
- `cognee.add(data, dataset_name=, node_set=[...])` — **node_set tags nodes with batch labels natively** (NodeSet nodes + membership edges). This powers time travel.
- `cognee.cognify(datasets=[...])` — LLM extraction. Structured output framework defaults to **instructor/litellm** (not BAML), so Groq works via `LLM_PROVIDER=custom`.
- `cognee.search(query_text, query_type=SearchType.GRAPH_COMPLETION, datasets=, node_type=NodeSet, node_name=[labels], verbose=True)`:
  - `verbose=True` → `[{text_result, context_result, objects_result}]` — answer + retrieved context + retrieved objects.
  - `node_type`/`node_name` scope retrieval to specific NodeSets → **native time-scoped asking** (no honest-disable needed).
  - **`SearchType.INSIGHTS` no longer exists in 1.2.2** (spec mentioned it; use objects_result instead).
- Graph read: `cognee.infrastructure.databases.graph.get_graph_engine()` → `await engine.get_graph_data()` → (nodes, edges) tuples.
- `cognee.prune.prune_data()` + `prune_system(metadata=True)` for /reset.

## Provenance strategy (/ask)
1. Exact: extract node IDs from `objects_result` (retrieved triplets/edges) — `graph.py:resolve_provenance`.
2. Fallback (honest, marked in code): name-match graph node labels against retrieved context text, + 1-hop edges between matches.
Actual shape of `objects_result` unverified until smoke test runs.

## LLM config (decision: Groq, not OpenAI — user override 2026-07-03)
- `env_setup.py` maps `GROQ_API_KEY` → `LLM_PROVIDER=custom`, `LLM_MODEL=groq/llama-3.3-70b-versatile`, `LLM_ENDPOINT=https://api.groq.com/openai/v1`.
- Embeddings stay OpenAI (`text-embedding-3-small`) — Groq has no embedding models. Requires real `OPENAI_API_KEY`.
- Env loaded from `backend/.env` then repo-root `.env.local`. Current `.env.local` keys are placeholders/non-Groq — **need real GROQ_API_KEY + OPENAI_API_KEY**.

## Batch/time-travel design
- Each ingest batch = one NodeSet label; `backend/batches.json` sidecar keeps chronological order + timestamps + doc counts.
- `/ask` with `batch_cutoff` scopes search to node_name=[all labels up to cutoff].

## Files
- `backend/main.py` — FastAPI: POST /ingest (background), GET /ingest/status, GET /graph, POST /ask, GET /batches, POST /reset. CORS localhost:3000.
- `backend/ingest.py` — GitHub issues/PRs → markdown → add+cognify; module-level `status` dict.
- `backend/graph.py` — graph snapshot normalization (defensive over tuple/object shapes), provenance resolution, chunk extraction.
- `backend/smoke.py` — Phase 1 proof (prune → 3 texts → graph → ask → provenance).
- `backend/env_setup.py` — env loading; import before cognee everywhere.
- Frontend: untouched Next.js scaffold at repo root (NOT in frontend/ yet — decide in Phase 2 whether to move; AGENTS.md warns this Next.js has breaking changes, read node_modules/next/dist/docs first).

## Known issues / risks
- Smoke test unrun: node/edge tuple shapes, `belongs_to_set` edge name, and objects_result shape are assumptions coded defensively — verify against smoke output.
- Groq free-tier rate limits may throttle cognify on 40+ docs; ingest limit param exists.

## Side quest (user request, separate from Rewind)
- cognee-memory plugin v0.2.0 installed (topoteretes/cognee-integrations marketplace). Its hooks/skills activate next session.
- Upload of user memory + skills to Cognee Cloud prepared in scratchpad (`upload_memory.py`, `memory_doc.md`) — blocked on `COGNEE_BASE_URL` (tenant URL) + `COGNEE_API_KEY` from platform.cognee.ai → API Keys.
