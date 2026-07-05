import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import Typewriter from "@/components/Typewriter";
import { ui } from "@/lib/design";

const FEATURES = [
  {
    title: "Memory graph",
    description:
      "Every entity and relationship Cognee extracted, rendered as a live force graph. Watch your agent's memory take shape.",
    accent: "text-sky-600",
    glyph: "◉",
  },
  {
    title: "Retrieval X-ray",
    description:
      "Ask a question and see exactly which nodes and edges produced the answer. The retrieved subgraph glows, everything else fades.",
    accent: "text-fuchsia-600",
    glyph: "◎",
  },
  {
    title: "Time travel",
    description:
      "Scrub back through ingest batches to see what the agent knew at any point, and ask questions against that older memory.",
    accent: "text-emerald-600",
    glyph: "↺",
  },
  {
    title: "Node inspector",
    description:
      "Click any node for its type, properties, source document, ingest batch, and connections. No more opaque memory.",
    accent: "text-amber-600",
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
    q: "Does it only work with the Cognee repo?",
    a: "No. The ingestion pipeline is generic: point it at any GitHub repository and it turns the issues and pull requests into a memory graph. We focused this demo on the Cognee repo because the hackathon is judged by its maintainers. Broader repo support in the hosted version is on the roadmap if there is demand.",
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
    <div className="min-h-screen bg-[#faf6f0] text-zinc-900">
      {/* Hero: the only section with the background video */}
      <section className="relative overflow-hidden bg-zinc-950 text-zinc-100">
        <video
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/rewind-bg-image.png"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
        >
          <source src="/assets/rewind-bg-video.mp4" type="video/mp4" />
        </video>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/25 via-zinc-950/35 to-zinc-950/60"
        />

        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6">
          <nav className="flex items-center justify-between py-6">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Image
                src="/assets/rewind-favicon/android-chrome-192x192.png"
                alt="Rewind logo"
                width={22}
                height={22}
                className="rounded-md"
              />
              Rewind <span className="font-normal text-zinc-400">- DevTools for AI memory</span>
            </span>
            <Link href="/debugger" className={ui.buttonGhostDark}>
              Open debugger
            </Link>
          </nav>

          <div className="flex flex-1 flex-col items-center justify-center pt-10 pb-40 text-center">
            <p className="mb-6 rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400">
              Built on <span className="text-zinc-200">Cognee</span> knowledge graphs
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              See what your agent
              <span className="block">
                <Typewriter />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
              Rewind is a memory debugger for Cognee-backed AI agents. Inspect the knowledge
              graph, X-ray every retrieval, and rewind memory to any point in time.
            </p>
            <div className="mt-10">
              <Link href="/debugger" className={ui.buttonHero}>
                Open the debugger →
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400">
                Works with <span className="text-zinc-200">any GitHub repo</span>
              </span>
              <span className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400">
                Demo data: <span className="text-zinc-200">topoteretes/cognee</span>
              </span>
            </div>
          </div>
        </div>

        {/* Animated scroll-down hint */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2.5 text-zinc-400">
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-zinc-400/70 pt-1.5">
            <span className="scroll-dot h-2 w-1 rounded-full bg-zinc-200" />
          </div>
          <span className="text-[11px] font-medium uppercase tracking-widest">
            Scroll down
          </span>
        </div>
      </section>

      {/* Everything below the hero: warm white */}
      <main className="mx-auto max-w-5xl px-6 py-20">
        {/* Doodly section ornament */}
        <svg
          aria-hidden
          viewBox="0 0 160 22"
          className="mx-auto mb-16 h-5 w-40 text-stone-300"
        >
          <path
            d="M4,13 C14,5 24,5 34,13 C44,21 54,21 64,13 C74,5 84,5 94,13 C104,21 114,21 124,13 C134,5 146,7 156,11"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`card-reveal group p-5 ${ui.cardLight}`}
            >
              <div
                className={`mb-3 inline-block text-lg ${f.accent} transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-125`}
              >
                {f.glyph}
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-zinc-900">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-600">{f.description}</p>
            </div>
          ))}
        </div>

        <section className="mt-32 w-full text-left">
          <p className={`text-center ${ui.eyebrowLight}`}>FAQ</p>
          <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight text-zinc-900">
            Questions worth asking
          </h2>
          <div className="mx-auto mt-12 max-w-3xl border-t border-stone-200">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group border-b border-stone-200">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-base font-medium text-zinc-900 transition-colors hover:text-black [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="text-lg font-light text-sky-600 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-sm leading-relaxed text-zinc-600">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
