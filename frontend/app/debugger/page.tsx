"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { askQuestion, getGraph } from "@/lib/api";
import type { AskResponse, GraphNode, GraphSnapshot } from "@/lib/types";
import Header from "@/components/Header";
import GraphView from "@/components/GraphView";
import AskPanel from "@/components/AskPanel";
import NodeInspector from "@/components/NodeInspector";

const EMPTY_GRAPH: GraphSnapshot = { nodes: [], links: [] };

export default function Home() {
  const [graph, setGraph] = useState<GraphSnapshot>(EMPTY_GRAPH);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [askResult, setAskResult] = useState<AskResponse | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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
  }, []);

  const retryLoadGraph = useCallback(() => {
    setStatus("connecting");
    setLoadError(null);
    fetchGraph();
  }, [fetchGraph]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  const handleAsk = useCallback(async (question: string) => {
    setAsking(true);
    setAskError(null);
    setAskResult(null);
    try {
      const result = await askQuestion(question);
      setAskResult(result);
    } catch (err) {
      setAskError(err instanceof Error ? err.message : "Failed to get an answer.");
    } finally {
      setAsking(false);
    }
  }, []);

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
      <Header status={status} nodeCount={graph.nodes.length} linkCount={graph.links.length} />
      <div className="flex flex-1 overflow-hidden">
        <main className="relative min-w-0 flex-1">
          {status === "connecting" && graph.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
              Loading memory graph...
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
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
            />
          )}
        </main>
        <aside className="flex w-96 shrink-0 flex-col border-l border-zinc-800 bg-zinc-950">
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
