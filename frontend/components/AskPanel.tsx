"use client";

import { useState } from "react";
import type { AskResponse } from "@/lib/types";

interface Props {
  onAsk: (question: string) => Promise<void>;
  asking: boolean;
  error: string | null;
  result: AskResponse | null;
}

export default function AskPanel({ onAsk, asking, error, result }: Props) {
  const [question, setQuestion] = useState("");

  const submit = () => {
    const q = question.trim();
    if (!q || asking) return;
    void onAsk(q);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Ask the memory graph..."
          disabled={asking}
          className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-500"
        />
        <button
          onClick={submit}
          disabled={asking || !question.trim()}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {asking ? "Asking..." : "Ask"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-sky-400">
              Answer
            </div>
            <p className="text-sm leading-relaxed text-zinc-100">{result.answer}</p>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Retrieved context ({result.context_chunks.length})
            </div>
            <div className="flex flex-col gap-2">
              {result.context_chunks.length === 0 && (
                <p className="text-xs text-zinc-600">No context chunks returned.</p>
              )}
              {result.context_chunks.map((chunk, i) => (
                <div
                  key={i}
                  className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2 text-xs text-zinc-400"
                >
                  <p className="line-clamp-4 whitespace-pre-wrap text-zinc-300">{chunk.text}</p>
                  <p className="mt-1 truncate text-[10px] text-zinc-600">{chunk.source}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-zinc-600">
            {result.retrieved_node_ids.length} nodes / {result.retrieved_edges.length} edges
            highlighted in the graph.
          </p>
        </div>
      )}
    </div>
  );
}
