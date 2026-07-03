"""Graph access + provenance resolution against cognee's graph engine (cognee 1.2.2)."""

import re
from typing import Any, Optional

from cognee.infrastructure.databases.graph import get_graph_engine

# Relationship names that attach a node to a NodeSet (batch tag).
SET_EDGE_NAMES = {"belongs_to_set", "is_part_of_set"}


def _node_tuple(node: Any) -> tuple[str, dict]:
    """Normalize a node from get_graph_data() to (id, properties)."""
    if isinstance(node, tuple):
        node_id, props = node[0], node[1] or {}
    else:
        props = dict(getattr(node, "attributes", {}) or {})
        node_id = getattr(node, "id", None) or props.get("id")
    return str(node_id), dict(props)


def _edge_tuple(edge: Any) -> tuple[str, str, str, dict]:
    """Normalize an edge to (source, target, label, properties)."""
    if isinstance(edge, tuple):
        source, target = str(edge[0]), str(edge[1])
        label = str(edge[2]) if len(edge) > 2 else ""
        props = dict(edge[3]) if len(edge) > 3 and edge[3] else {}
    else:
        props = dict(getattr(edge, "attributes", {}) or {})
        source = str(getattr(edge, "source_node_id", "") or props.get("source_node_id", ""))
        target = str(getattr(edge, "target_node_id", "") or props.get("target_node_id", ""))
        label = str(getattr(edge, "relationship_name", "") or props.get("relationship_name", ""))
    return source, target, label, props


def _clean_props(props: dict) -> dict:
    out = {}
    for key, value in props.items():
        if isinstance(value, (str, int, float, bool)) and key not in {"vector", "embedding"}:
            out[key] = value
    return out


async def get_graph_snapshot() -> dict:
    """Full graph as {nodes: [{id,label,type,batch,properties}], links: [{source,target,label}]}."""
    engine = await get_graph_engine()
    raw_nodes, raw_edges = await engine.get_graph_data()

    nodes: dict[str, dict] = {}
    for raw in raw_nodes:
        node_id, props = _node_tuple(raw)
        nodes[node_id] = {
            "id": node_id,
            "label": str(props.get("name") or props.get("text", "")[:60] or node_id[:8]),
            "type": str(props.get("type") or type(raw).__name__),
            "batch": None,
            "properties": _clean_props(props),
        }

    links = []
    set_membership: dict[str, str] = {}  # node id -> NodeSet node id
    for raw in raw_edges:
        source, target, label, _props = _edge_tuple(raw)
        links.append({"source": source, "target": target, "label": label})
        if label in SET_EDGE_NAMES:
            set_membership[source] = target

    # Batch = name of the NodeSet a node belongs to.
    for node_id, set_id in set_membership.items():
        set_node = nodes.get(set_id)
        if node_id in nodes and set_node:
            nodes[node_id]["batch"] = set_node["label"]

    # Keep links whose endpoints both exist (graph stores can return dangling refs).
    links = [l for l in links if l["source"] in nodes and l["target"] in nodes]
    return {"nodes": list(nodes.values()), "links": links}


def _extract_ids_from_objects(obj: Any, found: set[str]) -> None:
    """Recursively pull UUID-looking node ids out of retrieved objects (edges/triplets)."""
    if obj is None:
        return
    if isinstance(obj, dict):
        for key in ("id", "source_node_id", "target_node_id", "node_id"):
            value = obj.get(key)
            if value is not None:
                found.add(str(value))
        for value in obj.values():
            if isinstance(value, (dict, list, tuple)):
                _extract_ids_from_objects(value, found)
        return
    if isinstance(obj, (list, tuple)):
        for item in obj:
            _extract_ids_from_objects(item, found)
        return
    for attr in ("id", "source_node_id", "target_node_id"):
        value = getattr(obj, attr, None)
        if value is not None:
            found.add(str(value))
    for attr in ("node1", "node2", "attributes", "source_node", "target_node"):
        value = getattr(obj, attr, None)
        if value is not None and value is not obj:
            _extract_ids_from_objects(value, found)


def resolve_provenance(
    snapshot: dict,
    retrieved_objects: Any,
    context_text: str,
) -> tuple[list[str], list[dict]]:
    """Map retrieval output to graph node ids + involved edges.

    Strategy (honest, in order):
    1. Exact: node ids extracted from cognee's retrieved triplet/edge objects.
    2. Approximate fallback: case-insensitive name-match of graph node labels
       against the retrieved context text, plus 1-hop edges between matches.
    """
    node_ids: set[str] = set()
    _extract_ids_from_objects(retrieved_objects, node_ids)
    known = {n["id"] for n in snapshot["nodes"]}
    node_ids &= known

    if not node_ids and context_text:
        text = context_text.lower()
        for node in snapshot["nodes"]:
            label = node["label"].strip().lower()
            if len(label) >= 3 and not node["type"].lower().startswith(("textchunk", "textdocument")):
                if re.search(r"(?<!\w)" + re.escape(label) + r"(?!\w)", text):
                    node_ids.add(node["id"])

    edges = [
        {"source": l["source"], "target": l["target"], "label": l["label"]}
        for l in snapshot["links"]
        if l["source"] in node_ids and l["target"] in node_ids
    ]
    return sorted(node_ids), edges


def extract_context_chunks(context_result: Any, objects_result: Any = None) -> list[dict]:
    """Normalize retrieved context into [{text, source}]."""
    chunks: list[dict] = []

    def add(text: str, source: Optional[str] = None):
        text = (text or "").strip()
        if text:
            chunks.append({"text": text[:2000], "source": source or "knowledge graph"})

    if isinstance(context_result, str):
        add(context_result)
    elif isinstance(context_result, (list, tuple)):
        for item in context_result:
            if isinstance(item, str):
                add(item)
            elif isinstance(item, dict):
                add(str(item.get("text") or item.get("content") or item), item.get("source"))
            else:
                add(str(getattr(item, "text", item)))
    elif context_result is not None:
        add(str(context_result))
    return chunks
