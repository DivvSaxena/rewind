<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
(The Next.js docs above now live at `frontend/node_modules/next/dist/docs/` — the app moved to `frontend/`.)

# Project: Rewind — memory debugger for Cognee-backed AI agents

2-day hackathon judged by Cognee maintainers. Spec: `rewind-prompt-optimized.md`. Working > complete.

## Resume protocol
Read `PROGRESS.md` (phase state) + `context/BACKEND.md` + `context/FRONTEND.md` + `context/RUNBOOK.md`. Everything a fresh session needs is in those files + git log — do not rediscover.

## Layout
- `backend/` — FastAPI + cognee 1.2.2, Python 3.11 venv at `backend/.venv`. Groq LLM + local fastembed embeddings; **no OpenAI anywhere**.
- `frontend/` — Next.js (App Router) + TypeScript + Tailwind v4 + react-force-graph-2d. Landing at `/`, debugger at `/debugger`. Font: Plus Jakarta Sans.

## Hard rules
- **Secrets:** never write/print/commit real keys anywhere. Real key lives only in `backend/.env` (gitignored). Before commits, grep staged files for `gsk_`/`sk-`/`ghp_`/`ck_`.
- **Phase gates:** at each phase end — commit, update PROGRESS.md, 3-line summary, STOP for the user.
- Never poll long cognify runs in a loop; background them and stop.
- Import `env_setup` before `cognee` in every backend entrypoint.
