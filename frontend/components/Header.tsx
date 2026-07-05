"use client";

type Status = "connecting" | "connected" | "error";

interface Props {
  status: Status;
  nodeCount: number;
  linkCount: number;
  onReplayIntro?: () => void;
}

const STATUS_STYLES: Record<Status, { color: string; label: string }> = {
  connecting: { color: "bg-amber-400", label: "connecting" },
  connected: { color: "bg-emerald-400", label: "connected" },
  error: { color: "bg-red-500", label: "disconnected" },
};

export default function Header({ status, nodeCount, linkCount, onReplayIntro }: Props) {
  const { color, label } = STATUS_STYLES[status];

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5 py-3">
      <div className="flex items-baseline gap-3">
        <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
          Rewind <span className="font-normal text-zinc-500">- DevTools for AI memory</span>
        </h1>
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        {onReplayIntro && (
          <button
            onClick={onReplayIntro}
            className="rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            ↺ Replay demo
          </button>
        )}
        <span>
          {nodeCount} nodes / {linkCount} edges
        </span>
        <span className="flex items-center gap-1.5" title={label}>
          <span className={`h-2 w-2 rounded-full ${color}`} />
          {label}
        </span>
      </div>
    </header>
  );
}
