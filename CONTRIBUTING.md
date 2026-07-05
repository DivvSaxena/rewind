# Contributing to Rewind

Thanks for your interest in Rewind! It started as a 2-day hackathon project for the Cognee hackathon, so the codebase is small and easy to get into. Contributions of all sizes are welcome: bug fixes, features from the roadmap, docs, or polish.

## Project layout

| Path | What it is |
|------|------------|
| `backend/` | FastAPI + cognee 1.2.2 (Python 3.11). Ingestion, graph snapshots, ask/provenance, time travel. |
| `frontend/` | Next.js (App Router) + TypeScript + Tailwind v4. Landing page at `/`, debugger UI at `/debugger`. |
| `context/` | Working notes: `BACKEND.md`, `FRONTEND.md`, `RUNBOOK.md`, `DOMAINS.md`. Read these first, they explain most design decisions. |

## Getting set up

You need Python 3.11, Node 18+, and a free [Groq API key](https://console.groq.com). No OpenAI key is needed anywhere; embeddings run locally via fastembed.

Backend:

```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add your GROQ_API_KEY
uvicorn main:app --port 8000
```

Frontend (in a second terminal):

```bash
cd frontend
npm install
npm run dev                  # http://localhost:3000
```

To get data into the graph, follow the "Demo script" section of the README. Cognify takes a few minutes per batch, so start with a small one.

## Before you open a PR

1. **Frontend checks must pass:**

   ```bash
   cd frontend
   npx tsc --noEmit && npm run lint && npm run build
   ```

2. **Backend sanity:** run the server and confirm `GET /graph`, `POST /ask`, and `GET /batches` still respond. There is no test suite yet (contributions welcome!), so manual verification matters.

3. **No secrets in the diff.** Real keys live only in `backend/.env`, which is gitignored. Before committing, grep your staged changes for key prefixes such as `gsk_`, `sk-`, and `ghp_`.

4. Keep PRs focused: one feature or fix per PR, with a short description of what changed and why.

## Code conventions

- **Backend:** import `env_setup` before `cognee` in any new entrypoint, it maps env vars onto Cognee's config. Keep endpoints thin; graph logic lives in `graph.py`.
- **Frontend:** App Router with server components by default; add `"use client"` only where state or effects are needed. Styling is Tailwind, matching the existing zinc (dark) and warm-white palettes. The site font is Plus Jakarta Sans.
- **Copy:** no em dashes in any user-facing text or docs. Use commas, colons, or plain hyphens instead.
- **Honesty rule:** if a feature approximates something (like the provenance name-match fallback), label it clearly in code and UI. No fake provenance.

## Good first contributions

The roadmap in the README is the best starting point:

- **Memory diffing:** select two timeline points and show exactly which nodes and edges were learned in between.
- **Retrieval replay:** re-run a past question against each batch cutoff to find when the answer would have changed.
- **Live agent taps:** stream a running agent's new memories into the graph in real time.

Smaller ideas: a backend test suite, mobile layout for the debugger, keyboard navigation in the graph, or improving the node inspector.

## Questions

Open a GitHub issue, or reach out at hello@divvsaxena.com.
