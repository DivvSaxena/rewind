"use client";

import { useEffect, useState } from "react";

const WORDS = ["remembers", "learns", "forgets"];
const TYPE_MS = 90;
const DELETE_MS = 45;
const HOLD_MS = 2000;
const SWITCH_MS = 350;

export default function Typewriter() {
  const [wordIndex, setWordIndex] = useState(0);
  const [len, setLen] = useState(WORDS[0].length);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[wordIndex];
    let delay: number;
    let tick: () => void;

    if (!deleting && len < word.length) {
      delay = TYPE_MS;
      tick = () => setLen(len + 1);
    } else if (!deleting) {
      delay = HOLD_MS;
      tick = () => setDeleting(true);
    } else if (len > 0) {
      delay = DELETE_MS;
      tick = () => setLen(len - 1);
    } else {
      delay = SWITCH_MS;
      tick = () => {
        setDeleting(false);
        setWordIndex((wordIndex + 1) % WORDS.length);
      };
    }

    const t = setTimeout(tick, delay);
    return () => clearTimeout(t);
  }, [wordIndex, len, deleting]);

  return (
    <span className="whitespace-nowrap">
      <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">
        {WORDS[wordIndex].slice(0, len)}
      </span>
      <span aria-hidden className="animate-pulse font-light text-zinc-400">
        |
      </span>
    </span>
  );
}
