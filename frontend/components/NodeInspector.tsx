"use client";

import type { GraphNode } from "@/lib/types";

interface Props {
  node: GraphNode | null;
  connectedNodes: GraphNode[];
  onSelectNode: (node: GraphNode) => void;
  onClose: () => void;
}

function sourceUrl(properties: Record<string, string | number | boolean>): string | null {
  const value = properties.source_url ?? properties.url ?? properties.source;
  return typeof value === "string" && value.startsWith("http") ? value : null;
}

export default function NodeInspector({ node, connectedNodes, onSelectNode, onClose }: Props) {
  if (!node) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-zinc-600">
        Click a node in the graph to inspect it.
      </div>
    );
  }

  const url = sourceUrl(node.properties);

  return (
    <div key={node.id} className="panel-in flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            {node.type}
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">{node.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300"
          aria-label="Close inspector"
        >
          x
        </button>
      </div>

      {node.batch && (
        <div className="text-xs text-zinc-400">
          Batch: <span className="text-emerald-400">{node.batch}</span>
        </div>
      )}

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-sky-400 underline hover:text-sky-300"
        >
          {url}
        </a>
      )}

      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          Properties
        </div>
        <div className="flex flex-col gap-1">
          {Object.entries(node.properties).length === 0 && (
            <p className="text-xs text-zinc-600">No properties.</p>
          )}
          {Object.entries(node.properties).map(([key, value]) => (
            <div key={key} className="flex gap-2 text-xs">
              <span className="w-24 shrink-0 truncate text-zinc-500">{key}</span>
              <span className="truncate text-zinc-300">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          Connected nodes ({connectedNodes.length})
        </div>
        <div className="flex flex-col gap-1">
          {connectedNodes.length === 0 && (
            <p className="text-xs text-zinc-600">No connections.</p>
          )}
          {connectedNodes.map((n) => (
            <button
              key={n.id}
              onClick={() => onSelectNode(n)}
              className="truncate rounded px-2 py-1 text-left text-xs text-zinc-300 hover:bg-zinc-800"
            >
              <span className="text-zinc-500">{n.type}</span> {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
