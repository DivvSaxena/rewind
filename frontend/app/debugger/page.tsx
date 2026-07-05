"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { askQuestion, getBatches, getGraph } from "@/lib/api";
import type { AskResponse, Batch, GraphNode, GraphSnapshot } from "@/lib/types";
import Header from "@/components/Header";
import GraphView from "@/components/GraphView";
import AskPanel from "@/components/AskPanel";
import NodeInspector from "@/components/NodeInspector";
import Timeline from "@/components/Timeline";
import OnboardingModal from "@/components/OnboardingModal";

const EMPTY_GRAPH: GraphSnapshot = { nodes: [], links: [] };

export default function Home() {
  const [graph, setGraph] = useState<GraphSnapshot>(EMPTY_GRAPH);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [askResult, setAskResult] = useState<AskResponse | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [introSignal, setIntroSignal] = useState(0);

  // Resizable sidebar: drag the divider to grow the panel, capped at 45vw.
  const [sidebarWidth, setSidebarWidth] = useState(448);
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      const width = window.innerWidth - ev.clientX;
      const max = Math.round(window.innerWidth * 0.45);
      setSidebarWidth(Math.min(Math.max(width, 320), max));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);
  // null = full memory; otherwise label of the last batch included in the view.
  const [batchCutoff, setBatchCutoff] = useState<string | null>(null);

  const fetchGraph = useCallback(() => {
    getGraph()
      .then((data) => {
        setGraph(data);
        setStatus("connected");
      })
      .catch((err) => {
        setStatus("error");
        setLoadError(err instanceof Error ? err.message : "Failed to load graph.");
      });
    getBatches()
      .then((data) => setBatches(data.batches))
      .catch(() => setBatches([]));
  }, []);

  const retryLoadGraph = useCallback(() => {
    setStatus("connecting");
    setLoadError(null);
    fetchGraph();
  }, [fetchGraph]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  const handleAsk = useCallback(
    async (question: string) => {
      setAsking(true);
      setAskError(null);
      setAskResult(null);
      try {
        const result = await askQuestion(question, batchCutoff ?? undefined);
        setAskResult(result);
      } catch (err) {
        setAskError(err instanceof Error ? err.message : "Failed to get an answer.");
      } finally {
        setAsking(false);
      }
    },
    [batchCutoff]
  );

  // Moving the timeline invalidates a previous answer's provenance highlight.
  const handleCutoffChange = useCallback((cutoff: string | null) => {
    setBatchCutoff(cutoff);
    setAskResult(null);
    setAskError(null);
  }, []);

  // Batches included at the current cutoff (chronological order from /batches).
  const includedBatches = useMemo(() => {
    if (batchCutoff === null) return null; // null = everything
    const i = batches.findIndex((b) => b.label === batchCutoff);
    return i === -1 ? null : new Set(batches.slice(0, i + 1).map((b) => b.label));
  }, [batches, batchCutoff]);

  // Nodes beyond the cutoff fade out. A node's batch is its NodeSet label; the
  // NodeSet nodes themselves carry the label as their own label. Nodes with no
  // batch (untagged) always stay visible.
  const fadedNodeIds = useMemo(() => {
    if (!includedBatches) return new Set<string>();
    const faded = new Set<string>();
    for (const n of graph.nodes) {
      const batch = n.type === "NodeSet" ? n.label : n.batch;
      if (batch && !includedBatches.has(batch)) faded.add(n.id);
    }
    return faded;
  }, [graph.nodes, includedBatches]);

  const nodesById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph.nodes]);
  const selectedNode = selectedNodeId ? nodesById.get(selectedNodeId) ?? null : null;

  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const neighborIds = new Set<string>();
    for (const l of graph.links) {
      if (l.source === selectedNode.id) neighborIds.add(l.target);
      if (l.target === selectedNode.id) neighborIds.add(l.source);
    }
    return [...neighborIds]
      .map((id) => nodesById.get(id))
      .filter((n): n is GraphNode => Boolean(n));
  }, [selectedNode, graph.links, nodesById]);

  const handleSelectNode = useCallback((node: GraphNode | null) => {
    setSelectedNodeId(node ? node.id : null);
  }, []);

  const highlightNodeIds = useMemo(
    () => new Set(askResult?.retrieved_node_ids ?? []),
    [askResult]
  );
  const highlightActive = askResult !== null;

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <Header
        status={status}
        nodeCount={graph.nodes.length}
        linkCount={graph.links.length}
        onReplayIntro={() => setIntroSignal((s) => s + 1)}
      />
      <div className="flex flex-1 overflow-hidden">
        <main className="relative min-w-0 flex-1">
          {status === "connecting" && graph.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center">
              <p className="animate-pulse text-sm text-zinc-500">Loading memory graph...</p>
              <p className="max-w-sm text-xs leading-relaxed text-zinc-600">
                If the backend was idle, waking it up can take ~30 seconds. Hang tight.
              </p>
            </div>
          )}
          {status === "connected" && graph.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center">
              <p className="text-sm font-medium text-zinc-300">No memory yet</p>
              <p className="max-w-md text-xs leading-relaxed text-zinc-500">
                Ingest a GitHub repo to build the knowledge graph:{" "}
                <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-[11px] text-zinc-400">
                  POST /ingest {"{"}repo, batch_label{"}"}
                </code>{" "}
                then refresh. Cognify takes a few minutes per batch.
              </p>
              <button
                onClick={retryLoadGraph}
                className="mt-2 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Refresh
              </button>
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-zinc-500">
              <p className="text-red-400">{loadError}</p>
              <button
                onClick={retryLoadGraph}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Retry
              </button>
            </div>
          )}
          {graph.nodes.length > 0 && (
            <GraphView
              nodes={graph.nodes}
              links={graph.links}
              highlightNodeIds={highlightNodeIds}
              highlightActive={highlightActive}
              fadedNodeIds={fadedNodeIds}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
            />
          )}
          {graph.nodes.length > 0 && (
            <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-1.5 text-[11px] text-zinc-500">
              <span className="rounded-md border border-zinc-800/80 bg-zinc-950/80 px-2 py-1 backdrop-blur">
                <span className="text-zinc-300">Drag / scroll</span> to explore
              </span>
              <span className="rounded-md border border-zinc-800/80 bg-zinc-950/80 px-2 py-1 backdrop-blur">
                <span className="text-zinc-300">Click a node</span> to inspect
              </span>
              <span className="rounded-md border border-zinc-800/80 bg-zinc-950/80 px-2 py-1 backdrop-blur">
                <span className="text-zinc-300">Ask</span> to X-ray an answer
              </span>
              <span className="rounded-md border border-zinc-800/80 bg-zinc-950/80 px-2 py-1 backdrop-blur">
                <span className="text-zinc-300">Slider</span> to rewind time
              </span>
            </div>
          )}
          <OnboardingModal openSignal={introSignal} />
          {batches.length > 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4">
              <div className="w-full max-w-xl">
                <Timeline batches={batches} cutoff={batchCutoff} onChange={handleCutoffChange} />
              </div>
            </div>
          )}
        </main>
        <div
          onMouseDown={startResize}
          title="Drag to resize the panel"
          className="w-1.5 shrink-0 cursor-col-resize bg-zinc-800/60 transition-colors hover:bg-sky-500/70 active:bg-sky-500"
        />
        <aside
          style={{ width: sidebarWidth }}
          className="flex shrink-0 flex-col border-l border-zinc-800 bg-zinc-950"
        >
          <div className="h-1/2 min-h-0 overflow-hidden border-b border-zinc-800">
            <AskPanel onAsk={handleAsk} asking={asking} error={askError} result={askResult} />
          </div>
          <div className="h-1/2 min-h-0 overflow-hidden">
            <NodeInspector
              node={selectedNode}
              connectedNodes={connectedNodes}
              onSelectNode={handleSelectNode}
              onClose={() => setSelectedNodeId(null)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
