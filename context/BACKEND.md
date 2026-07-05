# Backend context (FastAPI + cognee 1.2.2, Python 3.11 venv at backend/.venv)

## Files
- `main.py` - endpoints: POST /ingest (background task), GET /ingest/status, GET /graph, POST /ask, GET /batches, POST /reset. CORS: localhost:3000.
- `ingest.py` - GitHub issues/PRs → markdown → `cognee.add(docs, dataset_name="rewind", node_set=[batch_label])` → `cognify_with_backoff`. `batches.json` sidecar = chronological batch order. Module-level `status` dict.
- `graph.py` - snapshot normalization, provenance resolution (exact via objects_result IDs, honest name-match fallback), context chunk extraction.
- `env_setup.py` - MUST be imported before cognee everywhere. Maps GROQ_API_KEY → LLM_PROVIDER=custom / groq llama-3.3-70b-versatile; embeddings = local fastembed (all-MiniLM-L6-v2). No OpenAI anywhere.
- `smoke.py` - Phase 1 proof: prune → 3 texts → graph → ask → provenance.

## Verified API facts (cognee 1.2.2, from package source + smoke run)
- `cognee.search(..., query_type=SearchType.GRAPH_COMPLETION, node_type=NodeSet, node_name=[labels], verbose=True)` → `[{text_result, context_result, objects_result}]`. `text_result` is a LIST of strings (main.py unwraps). `objects_result` = edge objects with `node1`/`node2` `Node(uuid, attributes)` → exact provenance.
- Graph read: `cognee.infrastructure.databases.graph.get_graph_engine()` → `await engine.get_graph_data()`.
- Batch tags: `belongs_to_set` edges to NodeSet nodes → `batch` field on nodes in /graph.
- SearchType.INSIGHTS does NOT exist in 1.2.2.

## ✅ Cross-process DB visibility (SOLVED 2026-07-04)
Root cause: cognee 1.2.2 defaults to multi-user access control → every dataset gets its OWN graph/vector DB, resolved via ContextVars set per add/cognify/search; a bare `get_graph_engine()` in a fresh process opens the empty global ladybug file. Fix: `ENABLE_BACKEND_ACCESS_CONTROL=false` in env_setup.py → single shared DB, survives restarts (verified).

## Other hard-won env_setup flags (all in env_setup.py, do not remove)
- `CACHING=false` - 1.2.2 session memory otherwise bleeds between /ask calls ("as previously mentioned…", 0 provenance).
- `LLM_RATE_LIMIT_ENABLED/REQUESTS/INTERVAL/TOKENS` (4/60/3400) - self-throttle under Groq free-tier TPM; cognee estimates tokens vs Groq actuals, so keep headroom.
- Groq quotas are per-model: 70B 100K TPD, 8B-instant 500K TPD + 6K TPM. `LLM_MODEL` env in .env can pin a model.
- Ladybug lock: a killed server can leave a `multiprocessing.spawn` child holding the DB lock - `pkill -f multiprocessing.spawn`.
- /ingest supports `offset` (skip N matching items → chronological batches) and cognify-only retries (`repo:""` → skip fetch/add, resume extraction of already-added docs).
- `/ingest` + `/reset` require `X-Admin-Token` header when `ADMIN_TOKEN` env is set (public deploys); CORS origins from `CORS_ORIGINS` env.

## Polish sprint additions (2026-07-05)
- `/ask` passes a custom `system_prompt` to `cognee.search` (supported in 1.2.2): detailed 2-4 sentence answers citing PRs/issues + a closing line starting exactly `Wisdom tip:` (frontend splits it out). No em dashes per user rule.
- Deployed on Fly (`rewind-backend`, region sin) with `min_machines_running = 1` (no cold starts; flip back to 0 after judging to save money).
- `CORS_ORIGINS` in fly.toml must list every frontend domain exactly (currently rewind-frontend.fly.dev, rewind-pink.vercel.app, tryrewind.vercel.app, localhost:3000). Checklist: `context/DOMAINS.md`.

## Secrets
Real key only in `backend/.env` (gitignored, human-managed). Never write/print/commit keys. Pre-commit: grep staged files for `gsk_`/`sk-`/`ghp_`/`ck_`.

## Run
`cd backend && source .venv/bin/activate && uvicorn main:app --port 8000`
