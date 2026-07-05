# Rewind - Progress

> Deep context for handoff lives in `context/BACKEND.md`, `context/FRONTEND.md`, `context/RUNBOOK.md`. Any future session: read those three + this file + git log.

## Current phase
**DEPLOYED + POLISHED (2026-07-05).** Live: frontend https://tryrewind.vercel.app (Vercel, auto-deploys from main; backup https://rewind-frontend.fly.dev is STALE, pre-polish), backend https://rewind-backend.fly.dev (Fly, region sin, `min_machines_running=1` so no cold starts through judging).

## Post-deploy polish sprint (2026-07-05)
- **Deploy fixes:** `tryrewind.vercel.app` domain added; must be in backend `CORS_ORIGINS` (fly.toml) or UI shows "Failed to fetch" - full checklist in `context/DOMAINS.md`.
- **Landing redesign:** background video in hero only (`public/assets/`), warm-white sections below (features, FAQ accordion, footer with By the Maker links), typewriter headline (remembers/learns/forgets), scroll-down hint, favicon set + logo, `/privacy` + `/terms` (real legal boilerplate, contact hello@divvsaxena.com only).
- **Debugger UX:** onboarding flow (welcome + 3 explainer slides + name + 5 profiling questions + pain-based playbook; localStorage `rewind-onboarding-v2`/`-profile`; Replay demo button in header + "?" corner button), instruction chips top-left, sample-question chips in AskPanel, resizable sidebar (drag divider, max 45vw), panel/pop animations.
- **Wisdom tips:** /ask now passes a custom `system_prompt` (detailed 2-4 sentence answers citing PRs + closing "Wisdom tip:" line); AskPanel splits the tip into an amber callout.
- **Design system:** `frontend/lib/design.ts` = single source for palette, graph colors, fonts, shared class strings. Use it for any new UI.
- **Repo:** CONTRIBUTING.md added; README updated; PRESENTATION.md gitignored (personal demo notes); rule one: NO EM DASHES in any copy.

## Final state (browser + API verified)
- Graph: **292 nodes / 859 links** from **45 real topoteretes/cognee issues/PRs** in 3 chronological batches (`issues-1-15`, `issues-16-30`, `issues-31-45`).
- Unscoped ask: "What database backends were discussed?" → PostgreSQL/Neo4j/pg/SQLAlchemy citing PRs #14/#31/#35; 20 provenance nodes / 17 edges → X-ray works on real data.
- Scoped ask (batch_cutoff=issues-1-15): same question → **only PostgreSQL** (Neo4j is later knowledge) - time travel provably changes answers.
- Timeline UI: slider + "Memory as of" badge + fade animation, 3 batches, zero console errors.
- Batch 3 note: its cognify never fully completed (free-tier caps); docs are all add()ed and partially extracted, entry added to batches.json manually. Graph is frozen good-enough by user decision.

## Phase 3 fixes (the hard-won knowledge)
- **Cross-process DB visibility (SOLVED):** cognee 1.2.2 defaults to multi-user access control → per-dataset DBs via ContextVars; bare `get_graph_engine()` opens an empty global DB in a fresh process. Fix: `ENABLE_BACKEND_ACCESS_CONTROL=false` (env_setup.py). Data now survives restarts - verified.
- **Session-memory bleed (SOLVED):** 1.2.2 enables session caching by default → /ask answered "as previously mentioned…" with 0 provenance. Fix: `CACHING=false` (env_setup.py).
- **Groq free-tier survival:** 70B = 100K TPD (exhausted by batch 1); 8B-instant = separate 500K TPD + 6K TPM (also exhausted by day's end). Mitigations that are now permanent: cognee LLM rate limiter (`LLM_RATE_LIMIT_*`, 3400 tokens/min), cognify-with-backoff, `offset` param on /ingest for chronological batches, cognify-only retry mode (`repo:""` skips GitHub refetch - docs resume from dataset).
- Ladybug holds a file lock via a spawned child process - kill strays (`pkill -f multiprocessing.spawn`) if "Lock is held by PID" appears.

## Ops / deploy (next step)
- `fly` CLI installed + authed. Configs ready: `backend/fly.toml` + Dockerfile (bakes deploy_data/ memory snapshot + fastembed model into image; `DATA_ROOT_DIRECTORY`/`SYSTEM_ROOT_DIRECTORY` env relocate cognee state), `frontend/fly.toml` + Dockerfile (Next standalone, `NEXT_PUBLIC_API_URL` build arg).
- Deploy order: stop server → `backend/export_memory.sh` → fly launch backend (secrets: `GROQ_API_KEY`, `ADMIN_TOKEN`; env `CORS_ORIGINS`=frontend URL) → fly launch frontend → verify.
- `/ingest` + `/reset` now 403 without `X-Admin-Token` when `ADMIN_TOKEN` is set; read/ask endpoints stay public for judges.
- Demo-day Groq budget: quotas roll off continuously; by next day 70B has ~fresh 100K TPD - plenty for asks (~3-5K each). fly.toml pins 8B; consider 70B for answer quality.

## Cognee facts (verified, still true)
- `cognee.add(data, dataset_name=, node_set=[batch])` → NodeSet nodes + `belongs_to_set` edges = native batch tags.
- `cognee.search(GRAPH_COMPLETION, node_type=NodeSet, node_name=[labels], verbose=True)` → `[{text_result(list), context_result, objects_result}]`; node_name scoping = native time-scoped asking.
- Graph read: `get_graph_engine()` → `get_graph_data()`. SearchType.INSIGHTS does not exist in 1.2.2.
- LLM: Groq via `LLM_PROVIDER=custom`; embeddings local fastembed. **No OpenAI anywhere.**

## Files (deltas this session)
- backend: `env_setup.py` (access-control off, caching off, rate limiter), `ingest.py` (offset, cognify-only retries), `main.py` (offset, env CORS, admin-token guard), `requirements.txt`, Dockerfile/fly.toml/export_memory.sh/.dockerignore.
- frontend: `components/Timeline.tsx` (new), `GraphView.tsx` (fade animation), `page.tsx` (cutoff state + faded set + Timeline), `AskPanel.tsx` (shimmer + time-travel note), `api.ts`/`types.ts` (batches), `next.config.ts` (standalone), Dockerfile/fly.toml/.dockerignore.
- root: README.md (real one), LICENSE (MIT).

## Side quest (done 2026-07-04)
Cognee Cloud: user memory + project docs + 3 SKILL.md files uploaded to `default_dataset`, recall verified. Creds in `backend/.env`. Plugin session-sync to cloud still unconfigured (needs env exports in shell profile).
