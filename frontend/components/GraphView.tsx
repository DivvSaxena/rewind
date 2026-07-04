"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods, NodeObject, LinkObject } from "react-force-graph-2d";
import type { GraphLink, GraphNode } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const TYPE_COLORS: Record<string, string> = {
  Entity: "#60a5fa",
  EntityType: "#a78bfa",
  TextSummary: "#f59e0b",
  DocumentChunk: "#fb923c",
  TextDocument: "#f97316",
  NodeSet: "#34d399",
};
const DEFAULT_COLOR = "#94a3b8";
const HIGHLIGHT_COLOR = "#38bdf8";
const SELECTED_COLOR = "#f472b6";
const DIM_OPACITY = 0.15;
const FADE_OPACITY = 0.08; // timeline: nodes beyond the batch cutoff
const ANIMATION_MS = 350;

function colorForType(type: string): string {
  return TYPE_COLORS[type] ?? DEFAULT_COLOR;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function endpointId(endpoint: unknown): string {
  return typeof endpoint === "object" && endpoint !== null
    ? String((endpoint as { id?: string }).id)
    : String(endpoint);
}

function linkKey(link: LinkObject): string {
  return `${endpointId(link.source)}->${endpointId(link.target)}`;
}

interface Props {
  nodes: GraphNode[];
  links: GraphLink[];
  highlightNodeIds: Set<string>;
  highlightActive: boolean;
  fadedNodeIds: Set<string>;
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode | null) => void;
}

export default function GraphView({
  nodes,
  links,
  highlightNodeIds,
  highlightActive,
  fadedNodeIds,
  selectedNodeId,
  onSelectNode,
}: Props) {
  const fgRef = useRef<ForceGraphMethods<NodeObject, LinkObject> | undefined>(undefined);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Timeline fade: animate each node between visible (1) and faded (FADE_OPACITY)
  // whenever the cutoff set changes, easing from the previously committed set.
  const fadeProgressRef = useRef(1);
  const fadeFromRef = useRef<Set<string>>(new Set());
  const fadeCommittedRef = useRef<Set<string>>(new Set());
  const fadeRafRef = useRef<number | null>(null);

  // Without explicit width/height the canvas defaults to the window size,
  // overflowing the flex column and swallowing clicks meant for the sidebar.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(
    () => ({
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({ ...l })),
    }),
    [nodes, links]
  );

  const highlightEdgeKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const l of links) {
      if (highlightNodeIds.has(l.source) && highlightNodeIds.has(l.target)) {
        keys.add(`${l.source}->${l.target}`);
      }
    }
    return keys;
  }, [links, highlightNodeIds]);

  // Animate a 0..1 progress value whenever X-ray highlight toggles, so the
  // dim/glow transition eases in/out instead of snapping.
  useEffect(() => {
    const target = highlightActive ? 1 : 0;
    const start = progressRef.current;
    const startTime = performance.now();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / ANIMATION_MS);
      progressRef.current = lerp(start, target, t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [highlightActive]);

  useEffect(() => {
    fadeFromRef.current = fadeCommittedRef.current;
    fadeCommittedRef.current = fadedNodeIds;
    fadeProgressRef.current = 0;
    const startTime = performance.now();
    if (fadeRafRef.current !== null) cancelAnimationFrame(fadeRafRef.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / ANIMATION_MS);
      fadeProgressRef.current = t;
      if (t < 1) {
        fadeRafRef.current = requestAnimationFrame(tick);
      }
    };
    fadeRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (fadeRafRef.current !== null) cancelAnimationFrame(fadeRafRef.current);
    };
  }, [fadedNodeIds]);

  const fadeOpacityFor = useCallback((id: string): number => {
    const from = fadeFromRef.current.has(id) ? FADE_OPACITY : 1;
    const to = fadeCommittedRef.current.has(id) ? FADE_OPACITY : 1;
    return lerp(from, to, fadeProgressRef.current);
  }, []);

  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as unknown as GraphNode & { x: number; y: number };
      if (n.x === undefined || n.y === undefined) return;
      const progress = progressRef.current;
      const isHighlighted = highlightNodeIds.has(n.id);
      const isSelected = n.id === selectedNodeId;
      const dimmed = highlightActive && !isHighlighted && !isSelected;
      const fadeOpacity = fadeOpacityFor(n.id);
      const opacity = (dimmed ? lerp(1, DIM_OPACITY, progress) : 1) * fadeOpacity;
      const baseColor = colorForType(n.type);
      const radius = isSelected ? 6.5 : isHighlighted && highlightActive ? 5.5 : 4;

      if (isHighlighted && highlightActive) {
        ctx.shadowColor = HIGHLIGHT_COLOR;
        ctx.shadowBlur = 14 * progress * fadeOpacity;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.fillStyle = rgba(isSelected ? SELECTED_COLOR : baseColor, opacity);
      ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isSelected) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = SELECTED_COLOR;
        ctx.stroke();
      }

      if (globalScale > 1.8) {
        ctx.font = `${10 / globalScale}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = `rgba(230, 230, 235, ${opacity})`;
        ctx.textAlign = "center";
        ctx.fillText(n.label.slice(0, 24), n.x, n.y + radius + 8 / globalScale);
      }
    },
    [highlightNodeIds, highlightActive, selectedNodeId, fadeOpacityFor]
  );

  const linkColor = useCallback(
    (link: LinkObject) => {
      const key = linkKey(link);
      const progress = progressRef.current;
      const fadeOpacity = Math.min(
        fadeOpacityFor(endpointId(link.source)),
        fadeOpacityFor(endpointId(link.target))
      );
      if (highlightActive && highlightEdgeKeys.has(key)) {
        return rgba(HIGHLIGHT_COLOR, lerp(0.35, 0.9, progress) * fadeOpacity);
      }
      const opacity = (highlightActive ? lerp(0.35, DIM_OPACITY, progress) : 0.35) * fadeOpacity;
      return rgba("#64748b", opacity);
    },
    [highlightActive, highlightEdgeKeys, fadeOpacityFor]
  );

  const linkWidth = useCallback(
    (link: LinkObject) => (highlightActive && highlightEdgeKeys.has(linkKey(link)) ? 1.6 : 0.6),
    [highlightActive, highlightEdgeKeys]
  );

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      {size && (
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={size.width}
        height={size.height}
        backgroundColor="#0a0a0c"
        nodeId="id"
        nodeCanvasObject={nodeCanvasObject}
        nodeLabel={(n) => (n as unknown as GraphNode).label}
        linkColor={linkColor}
        linkWidth={linkWidth}
        onNodeClick={(node) => onSelectNode(node as unknown as GraphNode)}
        onBackgroundClick={() => onSelectNode(null)}
        cooldownTime={4000}
        autoPauseRedraw={false}
      />
      )}
    </div>
  );
}
