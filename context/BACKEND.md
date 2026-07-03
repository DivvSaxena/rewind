# Backend context (FastAPI + cognee 1.2.2, Python 3.11 venv at backend/.venv)

## Files
- `main.py` — endpoints: POST /ingest (background task), GET /ingest/status, GET /graph, POST /ask, GET /batches, POST /reset. CORS: localhost:3000.
- `ingest.py` — GitHub issues/PRs → markdown → `cognee.add(docs, dataset_name="rewind", node_set=[batch_label])` → `cognify_with_backoff`. `batches.json` sidecar = chronological batch order. Module-level `status` dict.
- `graph.py` — snapshot normalization, provenance resolution (exact via objects_result IDs, honest name-match fallback), context chunk extraction.
- `env_setup.py` — MUST be imported before cognee everywhere. Maps GROQ_API_KEY → LLM_PROVIDER=custom / groq llama-3.3-70b-versatile; embeddings = local fastembed (all-MiniLM-L6-v2). No OpenAI anywhere.
- `smoke.py` — Phase 1 proof: prune → 3 texts → graph → ask → provenance.

## Verified API facts (cognee 1.2.2, from package source + smoke run)
- `cognee.search(..., query_type=SearchType.GRAPH_COMPLETION, node_type=NodeSet, node_name=[labels], verbose=True)` → `[{text_result, context_result, objects_result}]`. `text_result` is a LIST of strings (main.py unwraps). `objects_result` = edge objects with `node1`/`node2` `Node(uuid, attributes)` → exact provenance.
- Graph read: `cognee.infrastructure.databases.graph.get_graph_engine()` → `await engine.get_graph_data()`.
- Batch tags: `belongs_to_set` edges to NodeSet nodes → `batch` field on nodes in /graph.
- SearchType.INSIGHTS does NOT exist in 1.2.2.

## ⚠️ Known issue: cross-process DB visibility (hit 2026-07-03, unresolved)
Data ingested by one process (smoke.py) was NOT visible to a separately-started uvicorn process — `/graph` returned 0 nodes ("No nodes found in the database"), and concurrent access hit a ladybug file lock (`Could not set lock ... held by PID`). Each fresh process also logs "User ... has registered", suggesting per-process default-user scoping.
- Workaround used for verification: ingest + serve in the SAME process (scratchpad script, not committed).
- Normal operation is fine: /ingest runs as a FastAPI background task inside the server process.
- MUST INVESTIGATE for Phase 3: does data survive a uvicorn restart? If not, find how cognee resolves the default user/dataset across processes (ENABLE_BACKEND_ACCESS_CONTROL=false? DEFAULT_USER_EMAIL/PASSWORD envs in base_config.py?).

## Secrets
Real key only in `backend/.env` (gitignored, human-managed). Never write/print/commit keys. Pre-commit: grep staged files for `gsk_`/`sk-`/`ghp_`/`ck_`.

## Run
`cd backend && source .venv/bin/activate && uvicorn main:app --port 8000`
