export interface GraphNode {
  id: string;
  label: string;
  type: string;
  batch: string | null;
  properties: Record<string, string | number | boolean>;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
}

export interface GraphSnapshot {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ContextChunk {
  text: string;
  source: string;
}

export interface AskResponse {
  answer: string;
  retrieved_node_ids: string[];
  retrieved_edges: GraphLink[];
  context_chunks: ContextChunk[];
  batch_cutoff: string | null;
  scoped_to_batches: string[] | null;
}
