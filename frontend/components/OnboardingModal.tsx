"use client";

import { useState, useSyncExternalStore } from "react";
import { ui } from "@/lib/design";

const DONE_KEY = "rewind-onboarding-v2";
const PROFILE_KEY = "rewind-onboarding-profile";

/* ---------------- Intro slides: welcome + what Rewind is ---------------- */

interface Slide {
  glyph: string;
  accent: string;
  title: string;
  body: string;
  cta: string;
}

const SLIDES: Slide[] = [
  {
    glyph: "👋",
    accent: "text-sky-400",
    title: "Welcome to Rewind",
    body: "DevTools for AI memory. Agents with memory are black boxes: when one answers wrong, you can't see what it knew or where the answer came from. Rewind opens that box. Three quick slides show you how.",
    cta: "Show me →",
  },
  {
    glyph: "◉",
    accent: "text-sky-400",
    title: "See what your agent knows",
    body: "The graph behind this window is real memory: entities and relationships Cognee extracted from actual data. Drag to pan, scroll to zoom, and click any node to inspect its properties and source document.",
    cta: "Next →",
  },
  {
    glyph: "◎",
    accent: "text-fuchsia-400",
    title: "X-ray every answer",
    body: "Ask the memory a question and the exact nodes the answer was retrieved from light up while everything else dims. The provenance is real: it comes from Cognee's own retrieved objects, not a guess.",
    cta: "Next →",
  },
  {
    glyph: "↺",
    accent: "text-emerald-400",
    title: "Rewind memory in time",
    body: "Memory was ingested in chronological batches. Drag the timeline slider and later knowledge fades out; questions are then answered only from what the agent knew at that point. Watch knowledge appear over time.",
    cta: "Got it, quick questions →",
  },
];

/* ---------------- Questions: get to know the user ---------------- */

interface Question {
  id: string;
  prompt: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    id: "role",
    prompt: "First things first: what describes you best?",
    options: ["AI / ML engineer", "Backend developer", "Product or founder", "Just curious"],
  },
  {
    id: "experience",
    prompt: "Have you worked with agent memory or RAG before?",
    options: ["Yes, in production", "Experimenting with it", "Not yet, but interested"],
  },
  {
    id: "building",
    prompt: "What are you building or debugging right now?",
    options: ["An AI agent", "A RAG pipeline", "A knowledge graph", "Nothing yet, exploring"],
  },
  {
    id: "pain",
    prompt: "What is your biggest pain with AI memory?",
    options: [
      "I don't know what my agent knows",
      "I can't trace where answers come from",
      "I can't tell when it learned something",
      "Hallucinations and wrong answers",
    ],
  },
  {
    id: "goal",
    prompt: "Last one: what do you want to try first?",
    options: ["Explore the memory graph", "X-ray an answer", "Time travel", "Everything"],
  },
];

/** Pain point -> what to do in Rewind about it. */
const PLAYBOOK: Record<string, { title: string; steps: string[] }> = {
  "I don't know what my agent knows": {
    title: "Rewind makes memory visible",
    steps: [
      "Every dot in the graph is a real memory Cognee extracted. Drag to pan, scroll to zoom.",
      "Click any node to see its type, properties, and the source document it came from.",
    ],
  },
  "I can't trace where answers come from": {
    title: "Rewind X-rays every answer",
    steps: [
      "Ask a question in the panel on the right. Only the nodes used for the answer stay lit, everything else dims.",
      "The retrieved context below the answer shows the exact chunks Cognee used. No hand-waving.",
    ],
  },
  "I can't tell when it learned something": {
    title: "Rewind adds time travel to memory",
    steps: [
      "Drag the timeline at the bottom to an earlier batch. Later knowledge fades out of the graph.",
      "Ask the same question at two different points in time and watch the answer change.",
    ],
  },
  "Hallucinations and wrong answers": {
    title: "Rewind separates memory from make-believe",
    steps: [
      "Ask a question, then check the X-ray: a real answer lights up real provenance nodes.",
      "If an answer has thin or empty provenance, it was not grounded in memory. That is your bug, found.",
    ],
  },
};

const DEFAULT_PLAY = PLAYBOOK["I don't know what my agent knows"];

const CONTROLS = [
  ["Drag / scroll", "pan and zoom the graph"],
  ["Click a node", "inspect it in the sidebar"],
  ["Ask box", "X-ray where an answer came from"],
  ["Timeline slider", "rewind memory in time"],
] as const;

// Steps: intro slides, then the name step, then the questions, then results.
const NAME_STEP = SLIDES.length;
const FIRST_QUESTION = NAME_STEP + 1;
const TOTAL_STEPS = SLIDES.length + 1 + QUESTIONS.length;

const emptySubscribe = () => () => {};

interface OnboardingProps {
  /** Increment to reopen the intro from outside (e.g. a header button). */
  openSignal?: number;
}

export default function OnboardingModal({ openSignal = 0 }: OnboardingProps) {
  const done = useSyncExternalStore(
    emptySubscribe,
    () => localStorage.getItem(DONE_KEY) !== null,
    () => true
  );
  const [override, setOverride] = useState<"open" | "closed" | null>(null);
  const open = override !== null ? override === "open" : !done;

  // 0..3 = intro slides, 4 = name, 5..9 = questions, 10 = personalized results
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");

  // Reopen when the external signal changes (render-time state adjustment,
  // the React-approved alternative to setState-in-effect).
  const [seenSignal, setSeenSignal] = useState(openSignal);
  if (openSignal !== seenSignal) {
    setSeenSignal(openSignal);
    setStep(0);
    setAnswers({});
    setOverride("open");
  }

  const finish = () => {
    localStorage.setItem(DONE_KEY, "done");
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, ...answers }));
    setOverride("closed");
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setName("");
    setOverride("open");
  };

  if (!open) {
    return (
      <button
        onClick={restart}
        title="Replay the intro"
        className="absolute bottom-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
      >
        ?
      </button>
    );
  }

  const slide = step < SLIDES.length ? SLIDES[step] : null;
  const onNameStep = step === NAME_STEP;
  const question =
    step >= FIRST_QUESTION && step < TOTAL_STEPS ? QUESTIONS[step - FIRST_QUESTION] : null;
  const onResults = step >= TOTAL_STEPS;
  const play = PLAYBOOK[answers.pain] ?? DEFAULT_PLAY;
  const displayName = name.trim();

  const headerLabel = onResults
    ? displayName
      ? `${displayName}'s Rewind playbook`
      : "Your Rewind playbook"
    : slide
      ? step === 0
        ? "Welcome"
        : `What is Rewind · ${step} of ${SLIDES.length - 1}`
      : onNameStep
        ? "Introductions"
        : `Question ${step - FIRST_QUESTION + 1} of ${QUESTIONS.length}`;

  const personalizedPrompt = (q: Question): string =>
    displayName && q.id === "role"
      ? `Nice to meet you, ${displayName}! What describes you best?`
      : q.prompt;

  const pick = (option: string) => {
    if (!question) return;
    setAnswers((a) => ({ ...a, [question.id]: option }));
    setStep((s) => s + 1);
  };

  return (
    <div className={`fixed inset-0 z-30 flex items-center justify-center p-6 ${ui.overlayDark}`}>
      <div className={`pop-in w-full max-w-xl p-8 ${ui.cardDark}`}>
        {/* Progress */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            {headerLabel}
          </span>
          {!onResults && (
            <button
              onClick={finish}
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Skip intro
            </button>
          )}
        </div>
        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-300"
            style={{ width: `${(Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {slide && (
          <div key={step} className="panel-in">
            <div className={`text-3xl ${slide.accent}`}>{slide.glyph}</div>
            <h2 className="mt-3 text-2xl font-semibold text-zinc-100">{slide.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{slide.body}</p>
            <button
              onClick={() => setStep((s) => s + 1)}
              className={`mt-8 w-full ${ui.buttonPrimary}`}
            >
              {slide.cta}
            </button>
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="mt-4 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
              >
                ← Back
              </button>
            )}
          </div>
        )}

        {onNameStep && (
          <div key={step} className="panel-in">
            <h2 className="text-xl font-semibold text-zinc-100">
              What should we call you?
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              We&apos;ll use it to tailor the next few steps to you.
            </p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setStep((s) => s + 1);
              }}
              placeholder="Your name"
              className={`mt-5 w-full ${ui.inputDark}`}
            />
            <button
              onClick={() => setStep((s) => s + 1)}
              className={`mt-5 w-full ${ui.buttonPrimary}`}
            >
              {name.trim() ? `Continue as ${name.trim()} →` : "Continue →"}
            </button>
            <button
              onClick={() => setStep((s) => s - 1)}
              className="mt-4 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              ← Back
            </button>
          </div>
        )}

        {question && (
          <div key={step} className="panel-in">
            <h2 className="text-xl font-semibold text-zinc-100">
              {personalizedPrompt(question)}
            </h2>
            <div className="mt-6 flex flex-col gap-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => pick(option)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-5 py-3.5 text-left text-sm text-zinc-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500/60 hover:bg-zinc-800/80 hover:shadow-lg hover:shadow-sky-500/10"
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep((s) => s - 1)}
              className="mt-6 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              ← Back
            </button>
          </div>
        )}

        {onResults && (
          <div className="panel-in">
            <h2 className="text-xl font-semibold text-zinc-100">
              {displayName ? `${displayName}, here is the plan: ${play.title.toLowerCase()}` : play.title}
            </h2>
            <ol className="mt-4 flex flex-col gap-3">
              {play.steps.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-400">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-zinc-300">{s}</p>
                </li>
              ))}
            </ol>

            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Controls
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {CONTROLS.map(([what, does]) => (
                <div key={what} className={ui.chipDark}>
                  <span className="font-medium text-zinc-200">{what}</span>: {does}
                </div>
              ))}
            </div>

            <p className="mt-5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2.5 text-xs leading-relaxed text-sky-200">
              {displayName ? `${displayName}, try` : "Try"} this first: ask{" "}
              <span className="font-semibold">
                &quot;What database backends were discussed?&quot;
              </span>{" "}
              then drag the timeline back and ask it again.
            </p>

            <button onClick={finish} className={`mt-6 w-full ${ui.buttonPrimary}`}>
              Start exploring →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
