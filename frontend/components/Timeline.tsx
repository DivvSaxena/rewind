"use client";

import { useMemo } from "react";
import type { Batch } from "@/lib/types";
import { ui } from "@/lib/design";

interface Props {
  batches: Batch[];
  // null = full memory (no cutoff); otherwise the label of the last included batch.
  cutoff: string | null;
  onChange: (cutoff: string | null) => void;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Timeline({ batches, cutoff, onChange }: Props) {
  const cutoffIndex = useMemo(() => {
    if (cutoff === null) return batches.length - 1;
    const i = batches.findIndex((b) => b.label === cutoff);
    return i === -1 ? batches.length - 1 : i;
  }, [batches, cutoff]);

  if (batches.length === 0) return null;

  const current = batches[cutoffIndex];
  const atLatest = cutoffIndex === batches.length - 1;
  const includedDocs = batches
    .slice(0, cutoffIndex + 1)
    .reduce((sum, b) => sum + b.doc_count, 0);

  return (
    <div className={`pointer-events-auto flex flex-col gap-2 px-4 py-3 ${ui.panelDark}`}>
      <div className="flex items-center justify-between gap-3">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            atLatest
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/40 bg-amber-500/10 text-amber-300"
          }`}
        >
          Memory as of: {current.label}
          {!atLatest && " (time travel)"}
        </span>
        <span className="text-[11px] text-zinc-500">
          {includedDocs} docs · {cutoffIndex + 1}/{batches.length} batches
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={batches.length - 1}
        step={1}
        value={cutoffIndex}
        onChange={(e) => {
          const i = Number(e.target.value);
          onChange(i === batches.length - 1 ? null : batches[i].label);
        }}
        disabled={batches.length < 2}
        className="w-full accent-sky-400 disabled:opacity-40"
        aria-label="Memory timeline cutoff"
      />

      <div className="flex justify-between">
        {batches.map((b, i) => (
          <button
            key={b.label}
            onClick={() => onChange(i === batches.length - 1 ? null : b.label)}
            className={`flex flex-col items-start text-left text-[10px] leading-tight transition-colors ${
              i <= cutoffIndex ? "text-zinc-300" : "text-zinc-600"
            } hover:text-sky-300`}
            title={`${b.doc_count} docs · ingested ${formatTimestamp(b.timestamp)}`}
          >
            <span className="font-medium">{b.label}</span>
            <span className="text-zinc-500">{b.doc_count} docs</span>
          </button>
        ))}
      </div>
    </div>
  );
}
