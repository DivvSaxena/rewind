"use client";

import { useEffect, useState } from "react";

const QUIPS = [
  "Rummaging through the agent's memories...",
  "Untangling 859 relationships. It's complicated.",
  "Asking the graph nicely...",
  "Waking up the neurons, one node at a time...",
  "Consulting 292 nodes. Some of them are shy.",
  "Rewinding the tape, please hold...",
  "Blowing the dust off old pull requests...",
  "The agent is trying to remember where it put that...",
  "Following edges. Some lead to dead ends. Literally.",
  "Bribing the knowledge graph with embeddings...",
];

/** Rotating humorous loading line. Drop it under any spinner. */
export default function LoadingQuips({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % QUIPS.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <p key={index} className={`panel-in text-xs text-zinc-500 ${className}`}>
      {QUIPS[index]}
    </p>
  );
}
