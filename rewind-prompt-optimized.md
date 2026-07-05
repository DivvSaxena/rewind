# REWIND - OPTIMIZED BUILD PROMPT (Fable 5, usage-conscious)
# Paste everything below into Claude Code. Run Phase 1 on Fable (high effort),
# then /clear and switch to Sonnet for Phases 2–5.

---

You are building **Rewind: a memory debugger for Cognee-backed AI agents** - DevTools for AI memory. 2-day hackathon, judged by Cognee maintainers. Working > complete. Build only what's specified.

## Session economy rules (follow strictly)

- **State lives in the repo, not this chat.** Maintain `PROGRESS.md`: current phase, decisions made, cognee version + APIs confirmed, known issues. Update it at each phase gate. Any future session must be able to resume from `PROGRESS.md` + git log alone.
- **Stop at each phase gate.** Commit, update PROGRESS.md, print a 3-line summary, then STOP and wait for me. Do not start the next phase.
- **Read surgically.** When inspecting the cognee package, use grep/targeted file reads on specific modules - never dump whole files or directories into context. Never re-read a file you've already read this session.
- **Never poll long operations.** cognify can take minutes. Kick it off in the background (or tell me to run it), then stop and let me say "continue". Do not sit in a status-check loop.
- **Terse output.** No recaps, no restating the plan, no post-task summaries beyond the 3-line gate report.
- **Secrets: never write them, anywhere.** You must never write, paste, echo, print, log, or commit a real API key or token - not in `.env.example`, code, README, PROGRESS.md, commit messages, or chat output. The human adds real keys to `backend/.env` by hand; you only reference them via `os.environ` / config. `.env.example` contains placeholders only (e.g. `GROQ_API_KEY=your-key-here`). Before every commit, verify no staged file contains a string matching real key patterns (`gsk_`, `sk-`, `ghp_`, `ck_`); if found, stop and alert the human instead of committing. Confirm `backend/.env` is gitignored. If a real key ever appears in your context, do not repeat it back.

## Product (4 features, nothing else)

1. **Memory graph** - Cognee knowledge graph rendered as interactive 2D force graph (nodes = entities, edges = relationships).
2. **Retrieval X-ray (killer feature)** - on a question: show the answer AND highlight the subgraph that produced it (glow highlighted nodes/edges, dim rest to ~15% opacity, smooth transition). Side panel lists retrieved context chunks with sources.
3. **Time travel** - timeline slider filters graph to knowledge ingested up to a chosen batch; asking with a cutoff active queries only that state. If time-scoped *search* isn't feasible in this cognee version, filter the graph view only and disable time-scoped asking with a tooltip. Never fake answers.
4. **Node inspector** - click a node: type, properties, batch, source URL, connected nodes.

Demo dataset: Cognee GitHub repo history (issues/PRs as markdown), so "Why was graph completion added?" lights up issue → PR → author.

## Stack (no deviations, no extra deps)

- `backend/`: Python 3.11+, FastAPI + uvicorn, `cognee` (latest pip), `httpx`, `fastembed` (approved extra dep). Files: `main.py`, `ingest.py`, `graph.py`, `smoke.py`. CORS open to localhost:3000. Providers: Groq `llama-3.3-70b-versatile` for LLM, fastembed for local embeddings - no OpenAI anywhere. `.env.example` placeholders: `GROQ_API_KEY` + optional `GITHUB_TOKEN` only. On Groq 429 rate limits: retry with backoff and shrink batch size; never switch providers autonomously. Never hardcode keys.
- `frontend/`: Next.js (App Router) + TypeScript + Tailwind + `react-force-graph-2d`. Dark, Linear/Vercel-grade polish. Header: "Rewind - DevTools for AI memory" + node/edge counts + status dot.
- Verify cognee's actual installed API from package source (grep for `add`, `cognify`, `search`, SearchType enum, graph engine access) - do NOT trust memorized signatures.

## API (exactly these)

- `POST /ingest` `{repo, filter?, batch_label}` - fetch issues+PR discussions via GitHub REST → markdown docs with metadata header (number, title, date, author, url) → `add()` + `cognify()`. Tag docs with batch_label + timestamp (sidecar JSON/SQLite mapping doc→batch if cognee can't store it). Designed to run 2–3× with chronological batches (powers time travel). Expose `GET /ingest/status` for progress; ingest runs as a background task.
- `GET /graph` - `{nodes:[{id,label,type,batch,properties}], links:[{source,target,label}]}` pulled from cognee's graph engine.
- `POST /ask` `{question, batch_cutoff?}` - GRAPH_COMPLETION search for the answer + INSIGHTS/graph search for involved entities → resolve to node IDs. If exact retrieval provenance isn't exposed, approximate: extract entities from returned context chunks, name-match to graph nodes, include 1-hop edges. Mark the strategy honestly in code + README. Returns `{answer, retrieved_node_ids, retrieved_edges, context_chunks:[{text,source}]}`.
- `GET /batches`, `POST /reset` (cognee prune).

## Phases (gate after each)

1. **Cognee loop proof (Fable, this session):** install cognee, confirm APIs, ingest 3 hardcoded texts, `/graph` returns real nodes+edges, `/ask` returns answer + provenance node IDs. Write findings (version, graph store, extraction + provenance approach) to PROGRESS.md. ← highest risk; everything after is routine.
2. **Frontend core (Sonnet):** graph render from `/graph`, ask flow, X-ray highlight, inspector.
3. **Real data (Sonnet):** ingest 40–80 Cognee issues/PRs in 2–3 chronological batches; re-verify graph + ask.
4. **Timeline (Sonnet):** slider, batch filtering (fade animation), "Memory as of: X" badge, cutoff-aware asking or honest disable.
5. **Polish (Sonnet):** loading/empty states (shimmer during cognify), transitions, README (setup, env vars, demo script, provenance note, roadmap: 3 bullets + open-source license).

Cut order if time runs out: 4 before 3 before 2. Never cut the X-ray.

Start Phase 1 now. First message back: (a) cognee version installed, (b) default graph store, (c) one-paragraph plan for graph extraction + provenance. Then build.