# Runbook — run, verify, resume

## Run everything
```bash
# backend (port 8000)
cd backend && source .venv/bin/activate && uvicorn main:app --port 8000

# frontend (port 3000)
cd frontend && npm run dev
```
Open http://localhost:3000 (landing) → "Open the debugger" → /debugger.

## Seed demo data (3 sample texts, batch-1)
```bash
cd backend && source .venv/bin/activate && python smoke.py
```
⚠️ Due to the cross-process issue in context/BACKEND.md, data seeded by smoke.py may not be visible to a separately started uvicorn. If /graph returns 0 nodes, ingest via the API instead (POST /ingest) or run ingest+serve in one process. Investigate before Phase 3.

## Verify checklist (all passed 2026-07-03 on Phase 2)
- `cd frontend && npx tsc --noEmit && npm run lint && npm run build` — all clean.
- /debugger renders graph (30 nodes / 63 edges from smoke data), header counts + green status dot.
- Click node → inspector (type, batch, properties, connections). Click background → deselect.
- Ask "Why was graph completion added?" → correct answer, 13 nodes / 22 edges highlighted (glow + dim animation), context chunk listed.
- Landing page at / with Plus Jakarta Sans, CTA routes to /debugger.
- Browser check: playwright-core + `npx playwright install chromium`, screenshots + console-error capture (scripts were in session scratchpad; trivial to rewrite).

## Resume from here (phases 1–5 done; next: Fly.io deploy)
1. Read PROGRESS.md ("Ops / deploy" section has the exact order).
2. Deploy: stop backend → `backend/export_memory.sh` → `cd backend && fly launch --copy-config --no-deploy` → `fly secrets set GROQ_API_KEY=... ADMIN_TOKEN=...` → `fly deploy` → same for frontend with `--build-arg NEXT_PUBLIC_API_URL=<backend url>` → set backend `CORS_ORIGINS` to frontend URL.
3. Demo data is FROZEN (292 nodes / 859 links, 3 batches) — do NOT /reset or re-ingest before the demo; Groq daily quotas were exhausted 2026-07-04 and refill continuously.
4. Verify a deployed ask: unscoped → PostgreSQL/Neo4j answer; batch_cutoff=issues-1-15 → PostgreSQL only.
