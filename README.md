# Rewind — a memory debugger for Cognee-backed AI agents

**See what your agent knows, watch it learn, and rewind its memory in time.**

Rewind ingests real data into a [Cognee](https://github.com/topoteretes/cognee) knowledge graph and gives you DevTools for it:

- **Graph view** — the full memory graph, force-directed, colored by node type.
- **X-ray provenance** — ask a question and the exact nodes and edges the answer was retrieved from light up; everything else dims. No hand-waving: the highlight comes from Cognee's own retrieved objects.
- **Time travel** — data is ingested in chronological batches, each tagged as a native Cognee `NodeSet`. A timeline slider rewinds the graph to any batch: later knowledge fades out, and questions are answered *only from memory as of that point*.
- **Node inspector** — click any node for its type, batch, properties, source document, and connections.

Built in 2 days for the Cognee hackathon.

## How it works

```
frontend (Next.js + react-force-graph-2d)      backend (FastAPI + cognee 1.2.2)
  /debugger ──── GET  /graph ────────────────▶  ladybug graph store snapshot
             ─── POST /ask ──────────────────▶  cognee.search(GRAPH_COMPLETION,
             ─── GET  /batches                    node_type=NodeSet, verbose=True)
             ─── POST /ingest ───────────────▶  GitHub issues → cognee.add(node_set=[batch])
                                                 → cognee.cognify()  (Groq llama-3.3-70b)
```

- **Batches / time travel:** each ingest batch is a Cognee `NodeSet` label. Nodes link to their set via `belongs_to_set` edges, so batch membership lives *in the graph itself*. Asking with a cutoff passes `node_name=[batches up to cutoff]` to `cognee.search` — retrieval is natively scoped, not post-filtered.
- **Provenance (the X-ray):** `cognee.search(..., verbose=True)` returns `objects_result` — the actual retrieved triplets. We extract their node UUIDs and highlight exactly those (`backend/graph.py:resolve_provenance`). If a search returns no objects, we fall back to an honest, clearly-marked approximation: name-matching graph labels against the retrieved context text.
- **LLM:** Groq (`llama-3.3-70b-versatile`) through Cognee's custom litellm provider; embeddings run locally via fastembed (`all-MiniLM-L6-v2`). No OpenAI key needed.

## Setup

Backend (Python 3.11):

```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add your GROQ_API_KEY
uvicorn main:app --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev                  # http://localhost:3000
```

### Environment variables (`backend/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `GROQ_API_KEY` | yes | LLM for cognify + graph-completion answers |
| `GITHUB_TOKEN` | no | Raises GitHub API rate limits for `/ingest` |

`env_setup.py` maps these onto Cognee's config (custom LLM provider, local fastembed embeddings, single-user mode) — import it before `cognee` in any new entrypoint.

## Demo script

1. **Ingest history in batches** (each takes a few minutes to cognify):

```bash
curl -X POST localhost:8000/ingest -H 'Content-Type: application/json' \
  -d '{"repo":"topoteretes/cognee","batch_label":"issues-1-15","limit":15,"offset":0}'
# wait for {"state":"done"} on GET /ingest/status, then:
#   batch_label issues-16-30, offset 15 · batch_label issues-31-45, offset 30
```

2. Open **http://localhost:3000** → *Open the debugger*. The graph shows everything Cognee extracted.
3. **Ask** something like *"What database backends were discussed?"* — watch the X-ray: retrieved subgraph glows, the rest dims.
4. **Drag the timeline slider back.** Later batches fade out; the badge flips to *"Memory as of: issues-1-15 (time travel)"*. Ask the same question again — the answer now comes only from what the agent knew then.
5. Click any highlighted node to inspect its properties and source.

## Roadmap

- **Memory diffing** — select two timeline points and see exactly which nodes/edges the agent learned in between.
- **Retrieval replay** — step through a past `/ask`, re-running it against each batch cutoff to see when the answer would have changed.
- **Live agent taps** — attach to a running Cognee-backed agent and stream new memories into the graph in real time.

## License

[MIT](LICENSE)
