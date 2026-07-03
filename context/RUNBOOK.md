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

## Resume from here (next: Phase 3 per rewind-prompt-optimized.md)
1. Read PROGRESS.md, context/BACKEND.md, context/FRONTEND.md.
2. Resolve the cross-process DB visibility question first (blocks real ingest testing).
3. Phase 3: ingest 40–80 Cognee GitHub issues/PRs in 2–3 chronological batches via POST /ingest; re-verify graph + ask on real data. Groq free tier rate limits: backoff exists in ingest.py; use the `limit` param.
4. Phase 4: timeline slider (batch cutoff already plumbed end-to-end). Phase 5: polish + README.
5. Phase gates: commit, update PROGRESS.md, 3-line summary, STOP for the user.
