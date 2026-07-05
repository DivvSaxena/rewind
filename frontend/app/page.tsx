import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

const FEATURES = [
  {
    title: "Memory graph",
    description:
      "Every entity and relationship Cognee extracted, rendered as a live force graph. Watch your agent's memory take shape.",
    accent: "text-sky-400",
    glyph: "◉",
  },
  {
    title: "Retrieval X-ray",
    description:
      "Ask a question and see exactly which nodes and edges produced the answer — the retrieved subgraph glows, everything else fades.",
    accent: "text-fuchsia-400",
    glyph: "◎",
  },
  {
    title: "Time travel",
    description:
      "Scrub back through ingest batches to see what the agent knew at any point — and ask questions against that older memory.",
    accent: "text-emerald-400",
    glyph: "↺",
  },
  {
    title: "Node inspector",
    description:
      "Click any node for its type, properties, source document, ingest batch, and connections. No more opaque memory.",
    accent: "text-amber-400",
    glyph: "⌕",
  },
];

const FAQS = [
  {
    q: "What is Rewind?",
    a: "Rewind is a memory debugger for AI agents built on Cognee. It renders the agent's knowledge graph, shows exactly which memories produced each answer, and lets you rewind memory to an earlier point in time.",
  },
  {
    q: "What data is in the demo?",
    a: "The first 45 issues and pull requests of the Cognee repository, ingested through Cognee itself in three chronological batches: 292 nodes and 859 relationships extracted by an LLM.",
  },
  {
    q: "How does the retrieval X-ray work?",
    a: "When you ask a question, Cognee returns the exact triplets it retrieved to answer it. Rewind extracts their node IDs and highlights precisely those nodes and edges in the graph, so the provenance is real, not approximated.",
  },
  {
    q: "How does time travel work?",
    a: "Each ingest batch is tagged as a native Cognee NodeSet, so batch membership lives in the graph itself. Dragging the timeline restricts retrieval to the batches that existed at that point, meaning answers come only from what the agent knew then.",
  },
  {
    q: "Is it open source?",
    a: "Yes. The full stack (FastAPI + Cognee backend, Next.js frontend) is MIT-licensed on GitHub.",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Background video, dimmed so the content stays readable */}
      <video
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/assets/rewind-bg-image.png"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-60"
      >
        <source src="/assets/rewind-bg-video.mp4" type="video/mp4" />
      </video>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-zinc-950/25 via-zinc-950/35 to-zinc-950/60"
      />

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-64 left-1/2 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6">
        <nav className="flex items-center justify-between py-6">
          <span className="text-sm font-semibold tracking-tight">
            Rewind <span className="font-normal text-zinc-500">— DevTools for AI memory</span>
          </span>
          <Link
            href="/debugger"
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            Open debugger
          </Link>
        </nav>

        <main className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <p className="mb-6 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400">
            Built on <span className="text-zinc-200">Cognee</span> knowledge graphs
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
            See what your agent{" "}
            <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">
              remembers
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Rewind is a memory debugger for Cognee-backed AI agents. Inspect the knowledge
            graph, X-ray every retrieval, and rewind memory to any point in time.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/debugger"
              className="rounded-md bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-white"
            >
              Open the debugger →
            </Link>
            <a
              href="https://github.com/topoteretes/cognee"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-zinc-800 px-6 py-3 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
            >
              What is Cognee?
            </a>
          </div>

          <div className="mt-24 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-700"
              >
                <div className={`mb-3 text-lg ${f.accent}`}>{f.glyph}</div>
                <h3 className="mb-1.5 text-sm font-semibold text-zinc-100">{f.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{f.description}</p>
              </div>
            ))}
          </div>

          <section className="mt-24 w-full text-left">
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
            <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-lg border border-zinc-800/80 bg-zinc-900/40 transition-colors hover:border-zinc-700 open:border-zinc-700"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-zinc-100 [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span className="text-zinc-500 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        </main>

      </div>
      <SiteFooter />
    </div>
  );
}
