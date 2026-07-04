# Frontend context (Next.js 16.2.10, App Router, Tailwind v4)

Read `node_modules/next/dist/docs/` before assuming Next.js APIs — this version differs from training data.

## Structure
- `frontend/app/page.tsx` — landing page (server component). Dark, gradient hero, feature cards, CTA → `/debugger`.
- `frontend/app/debugger/page.tsx` — the debugger UI (client component). Owns all state: graph snapshot, ask result, selected node. Composes Header / GraphView / AskPanel / NodeInspector.
- `frontend/components/GraphView.tsx` — react-force-graph-2d wrapper (dynamic import, ssr:false).
- `frontend/components/AskPanel.tsx` — question input + answer + context chunks.
- `frontend/components/NodeInspector.tsx` — type/batch/properties/source URL/connected nodes; click a connection to navigate.
- `frontend/components/Header.tsx` — title, node/edge counts, status dot.
- `frontend/lib/api.ts` — fetch client; `NEXT_PUBLIC_API_URL` env, default `http://localhost:8000`.
- `frontend/lib/types.ts` — mirrors backend response shapes exactly.

## Key decisions / gotchas (learned the hard way)
- **GraphView must receive explicit width/height.** Without them the canvas defaults to window size, overflows the flex layout, covers the sidebar, and swallows its clicks. Solved with a ResizeObserver on the container div; ForceGraph2D renders only once size is known. Do not remove.
- `<main>` needs `min-w-0` (flex children default to `min-width:auto` and get pushed by canvas intrinsic size).
- **X-ray animation:** `progressRef` (0→1) animated via rAF in GraphView; `autoPauseRedraw={false}` keeps the canvas repainting so ref-driven opacity changes actually render. Dim = 15% opacity, highlight = sky glow (shadowBlur).
- Highlighted edges = edges whose BOTH endpoints are in `retrieved_node_ids`.
- force-graph mutates link source/target from string → node object after layout; use `linkKey()`/`endpointId()` helpers.
- eslint (react-hooks) rejects setState-in-effect patterns; initial fetch uses a `.then()` callback inside `useCallback` invoked from `useEffect` — keep that shape.
- Font: Plus Jakarta Sans (next/font/google, `--font-jakarta-sans`), Geist Mono for mono. Canvas node labels also use "Plus Jakarta Sans".
- Node colors by type in `TYPE_COLORS` (GraphView): Entity blue, EntityType purple, chunk-ish types orange/amber, NodeSet green.

## Commands
- `cd frontend && npm run dev` (port 3000), `npm run build`, `npm run lint`, `npx tsc --noEmit`.
- `next.config.ts` pins `turbopack.root` to frontend/ (silences multi-lockfile warning).

## Phase 4/5 (done 2026-07-04)
- `components/Timeline.tsx` — slider over /batches, "Memory as of: X" badge (emerald=latest, amber=time travel), per-batch tick buttons. Overlaid bottom-center of the graph (`pointer-events-none` wrapper, `pointer-events-auto` card).
- GraphView fade: `fadedNodeIds` prop; per-node opacity animated between committed/previous sets via `fadeFromRef`/`fadeCommittedRef`/`fadeProgressRef` (same rAF pattern as X-ray). Fade multiplies with X-ray dim; links take min of endpoint fades.
- page.tsx: `batchCutoff` state (null = full memory); faded set = nodes whose batch (or NodeSet label) is beyond cutoff; cutoff change clears askResult; cutoff passed to askQuestion.
- AskPanel: skeleton shimmer while asking; amber time-travel note when result.batch_cutoff set.
- Empty state ("No memory yet" + POST /ingest hint) and pulse loading state on the graph pane.
- `next.config.ts`: `output: "standalone"` for the Fly Docker build (see frontend/Dockerfile — NEXT_PUBLIC_API_URL is a build arg).
- playwright-core is a devDependency; verification script pattern lives in git history of scratchpad (launch chrome-headless-shell from ~/Library/Caches/ms-playwright).
