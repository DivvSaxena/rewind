"""Phase 1 proof: prune -> add 3 texts -> cognify -> graph -> ask with provenance."""

import asyncio
import json

import env_setup  # noqa: F401

import cognee
from cognee import SearchType
from cognee.modules.engine.models.node_set import NodeSet

import ingest
from graph import extract_context_chunks, get_graph_snapshot, resolve_provenance

TEXTS = [
    "Cognee is an open-source memory engine for AI agents, created by Topoteretes. "
    "It turns documents into a knowledge graph combined with vector embeddings.",
    "Graph completion was added to Cognee so that agents can answer questions using "
    "multi-hop reasoning over the knowledge graph instead of plain vector search.",
    "Rewind is a memory debugger for Cognee-backed agents. It visualizes the knowledge "
    "graph and highlights which nodes were retrieved to answer a question.",
]


async def main():
    print("== prune ==")
    await cognee.prune.prune_data()
    await cognee.prune.prune_system(metadata=True)

    print("== add + cognify (batch-1) ==")
    await ingest.ingest_texts(TEXTS, "batch-1")

    print("== graph ==")
    snapshot = await get_graph_snapshot()
    print(f"nodes={len(snapshot['nodes'])} links={len(snapshot['links'])}")
    types = {}
    for n in snapshot["nodes"]:
        types[n["type"]] = types.get(n["type"], 0) + 1
    print("node types:", types)
    batched = [n for n in snapshot["nodes"] if n["batch"]]
    print(f"nodes with batch tag: {len(batched)} (sample: {[n['label'] for n in batched[:3]]})")
    edge_labels = sorted({l["label"] for l in snapshot["links"]})
    print("edge labels:", edge_labels[:15])

    print("== ask ==")
    results = await cognee.search(
        query_text="Why was graph completion added to Cognee?",
        query_type=SearchType.GRAPH_COMPLETION,
        datasets=[ingest.DATASET],
        node_type=NodeSet,
        verbose=True,
    )
    first = results[0] if isinstance(results, list) and results else results
    if isinstance(first, dict):
        answer = first.get("text_result")
        context = first.get("context_result")
        objects = first.get("objects_result")
    else:
        answer, context, objects = str(first), None, None
    print("ANSWER:", str(answer)[:300])
    print("OBJECTS type:", type(objects).__name__)
    try:
        print("OBJECTS sample:", json.dumps(objects, default=str)[:600])
    except Exception:
        print("OBJECTS repr:", repr(objects)[:600])

    node_ids, edges = resolve_provenance(
        snapshot, objects, context if isinstance(context, str) else str(context or "")
    )
    id_to_label = {n["id"]: n["label"] for n in snapshot["nodes"]}
    print(f"PROVENANCE: {len(node_ids)} nodes, {len(edges)} edges")
    print("  nodes:", [id_to_label.get(i, i) for i in node_ids][:10])
    print("CHUNKS:", len(extract_context_chunks(context)))
    print("== smoke OK ==")


if __name__ == "__main__":
    asyncio.run(main())
