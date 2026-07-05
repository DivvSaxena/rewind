# Frontend context (Next.js 16.2.10, App Router, Tailwind v4)

Read `node_modules/next/dist/docs/` before assuming Next.js APIs - this version differs from training data.

## Structure
- `frontend/app/page.tsx` - landing page (server component). Dark, gradient hero, feature cards, CTA → `/debugger`.
- `frontend/app/debugger/page.tsx` - the debugger UI (client component). Owns all state: graph snapshot, ask result, selected node. Composes Header / GraphView / AskPanel / NodeInspector.
- `frontend/components/GraphView.tsx` - react-force-graph-2d wrapper (dynamic import, ssr:false).
- `frontend/components/AskPanel.tsx` - question input + answer + context chunks.
- `frontend/components/NodeInspector.tsx` - type/batch/properties/source URL/connected nodes; click a connection to navigate.
- `frontend/components/Header.tsx` - title, node/edge counts, status dot.
- `frontend/lib/api.ts` - fetch client; `NEXT_PUBLIC_API_URL` env, default `http://localhost:8000`.
- `frontend/lib/types.ts` - mirrors backend response shapes exactly.

## Key decisions / gotchas (learned the hard way)
- **GraphView must receive explicit width/height.** Without them the canvas defaults to window size, overflows the flex layout, covers the sidebar, and swallows its clicks. Solved with a ResizeObserver on the container div; ForceGraph2D renders only once size is known. Do not remove.
- `<main>` needs `min-w-0` (flex children default to `min-width:auto` and get pushed by canvas intrinsic size).
- **X-ray animation:** `progressRef` (0→1) animated via rAF in GraphView; `autoPauseRedraw={false}` keeps the canvas repainting so ref-driven opacity changes actually render. Dim = 15% opacity, highlight = sky glow (shadowBlur).
- Highlighted edges = edges whose BOTH endpoints are in `retrieved_node_ids`.
- force-graph mutates link source/target from string → node object after layout; use `linkKey()`/`endpointId()` helpers.
- eslint (react-hooks) rejects setState-in-effect patterns; initial fetch uses a `.then()` callback inside `useCallback` invoked from `useEffect` - keep that shape.
- Font: Plus Jakarta Sans (next/font/google, `--font-jakarta-sans`), Geist Mono for mono. Canvas node labels also use "Plus Jakarta Sans".
- Node colors by type in `TYPE_COLORS` (GraphView): Entity blue, EntityType purple, chunk-ish types orange/amber, NodeSet green.

## Commands
- `cd frontend && npm run dev` (port 3000), `npm run build`, `npm run lint`, `npx tsc --noEmit`.
- `next.config.ts` pins `turbopack.root` to frontend/ (silences multi-lockfile warning).

## Phase 4/5 (done 2026-07-04)
- `components/Timeline.tsx` - slider over /batches, "Memory as of: X" badge (emerald=latest, amber=time travel), per-batch tick buttons. Overlaid bottom-center of the graph (`pointer-events-none` wrapper, `pointer-events-auto` card).
- GraphView fade: `fadedNodeIds` prop; per-node opacity animated between committed/previous sets via `fadeFromRef`/`fadeCommittedRef`/`fadeProgressRef` (same rAF pattern as X-ray). Fade multiplies with X-ray dim; links take min of endpoint fades.
- page.tsx: `batchCutoff` state (null = full memory); faded set = nodes whose batch (or NodeSet label) is beyond cutoff; cutoff change clears askResult; cutoff passed to askQuestion.
- AskPanel: skeleton shimmer while asking; amber time-travel note when result.batch_cutoff set.
- Empty state ("No memory yet" + POST /ingest hint) and pulse loading state on the graph pane.
- `next.config.ts`: `output: "standalone"` for the Fly Docker build (see frontend/Dockerfile - NEXT_PUBLIC_API_URL is a build arg).
- playwright-core is a devDependency; verification script pattern lives in git history of scratchpad (launch chrome-headless-shell from ~/Library/Caches/ms-playwright).

## Polish sprint (2026-07-05)
- **`lib/design.ts` is the design system.** Palette, graph node colors, canvas font, and shared Tailwind class strings (buttons, inputs, panels, chips, footer links). GraphView, AskPanel, Timeline, SiteFooter, OnboardingModal, and page.tsx consume it. Add new UI through it.
- **Landing (`app/page.tsx`):** video hero only (assets in `public/assets/`, poster image while loading, `absolute` not `fixed`); warm-white `#faf6f0` sections below: feature cards (hover lift + `card-reveal` scroll-driven animation), FAQ accordion (native details/summary, divider style), squiggle SVG ornament. `components/Typewriter.tsx` cycles remembers/learns/forgets on its own headline line (prevents layout jump). Scroll-down mouse hint (`scroll-dot` keyframes). `components/SiteFooter.tsx`: brand + Product/Legal/By the Maker columns, inline-style grid `1.5fr 1fr 1fr 1fr`.
- **Legal:** `/privacy` + `/terms` = full boilerplate (as-is, liability, AI disclaimer, India law). Contact email everywhere is hello@divvsaxena.com ONLY.
- **Onboarding (`components/OnboardingModal.tsx`):** welcome slide → 3 explainer slides → name input → 5 profiling questions → pain-based playbook with controls legend. Keys: `rewind-onboarding-v2` (done flag), `rewind-onboarding-profile` (answers). Reopen via `openSignal` prop (Header "Replay demo" button increments it; render-time state adjustment, NOT setState-in-effect) or the "?" corner button.
- **Debugger:** instruction chips top-left of graph; sample-question chips in AskPanel (click = ask); `splitWisdom()` in AskPanel separates the backend's "Wisdom tip:" line into an amber callout; sidebar resizable via drag divider (min 320px, max 45vw, mouse listeners on window); Header title is just "Rewind" linking to `/`.
- **Animations in globals.css:** `card-reveal` (scroll-driven, @supports-gated), `panel-in` (sidebar/step content), `pop-in` (modal card), `scroll-dot`.
- **Copy rule: NO EM DASHES anywhere.** Use hyphens, commas, colons.
- Favicons: `public/assets/rewind-favicon/` wired via layout metadata + fixed site.webmanifest paths.
