"use client";

import { useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "rewind-onboarding-seen";

const STEPS = [
  {
    title: "Explore the memory graph",
    body: "Every dot is something the agent remembers: entities and concepts extracted by Cognee. Drag to pan, scroll to zoom, click any node to inspect its type, batch, and source.",
  },
  {
    title: "Ask a question, see the X-ray",
    body: "Type a question in the Ask panel. The answer is generated from the graph, and the exact nodes it was retrieved from light up while everything else dims.",
  },
  {
    title: "Rewind memory in time",
    body: "Data was ingested in chronological batches. Drag the timeline slider at the bottom to rewind: later knowledge fades out, and questions are answered only from what the agent knew at that point.",
  },
];

const emptySubscribe = () => () => {};

export default function OnboardingModal() {
  // Hydration-safe localStorage read: the server snapshot says "seen" so the
  // prerender matches, then the real value kicks in after hydration.
  const seen = useSyncExternalStore(
    emptySubscribe,
    () => localStorage.getItem(STORAGE_KEY) !== null,
    () => true
  );
  const [override, setOverride] = useState<"open" | "closed" | null>(null);
  const open = override !== null ? override === "open" : !seen;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOverride("closed");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOverride("open")}
        title="How does this work?"
        className="absolute bottom-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
      >
        ?
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/80 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-100">
          Welcome to Rewind
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          DevTools for AI memory. Three things to try:
        </p>

        <ol className="mt-5 flex flex-col gap-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-400">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-200">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <button
          onClick={dismiss}
          className="mt-6 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400"
        >
          Start exploring
        </button>
        <p className="mt-2 text-center text-[11px] text-zinc-600">
          Reopen this anytime with the ? button in the corner.
        </p>
      </div>
    </div>
  );
}
