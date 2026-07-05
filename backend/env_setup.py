"""Load env vars before cognee is imported (cognee reads LLM_* config at import/config time)."""

import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent

load_dotenv(ROOT / "backend" / ".env")

# LLM: Groq through cognee's "custom" (litellm) provider.
if os.getenv("GROQ_API_KEY"):
    os.environ.setdefault("LLM_PROVIDER", "custom")
    os.environ.setdefault("LLM_MODEL", "groq/llama-3.3-70b-versatile")
    os.environ.setdefault("LLM_ENDPOINT", "https://api.groq.com/openai/v1")
    os.environ["LLM_API_KEY"] = os.environ["GROQ_API_KEY"]

# Stateless /ask: cognee 1.2.2 enables session memory by default, which makes
# searches remember previous answers ("as I said before...") and can short-circuit
# graph retrieval. Rewind's asks must be independent, reproducible queries.
os.environ.setdefault("CACHING", "false")

# Single-user local backend: disable per-dataset database routing so every process
# (server, scripts) reads the same graph store and data survives restarts.
# With the 1.2.2 default (multi-user access control on), add/cognify/search write to
# per-dataset DBs resolved via ContextVars, while a bare get_graph_engine() opens the
# empty global DB - /graph in a fresh process sees 0 nodes.
os.environ.setdefault("ENABLE_BACKEND_ACCESS_CONTROL", "false")

# Self-throttle LLM calls under Groq's free-tier per-minute token cap (6K TPM for
# 8b-instant) so cognify paces itself instead of erroring mid-batch. Harmless but
# slower on paid tiers - raise/remove these if you upgrade.
os.environ.setdefault("LLM_RATE_LIMIT_ENABLED", "true")
os.environ.setdefault("LLM_RATE_LIMIT_REQUESTS", "4")
os.environ.setdefault("LLM_RATE_LIMIT_INTERVAL", "60")
# Well under the 6K cap: cognee estimates tokens, Groq counts actuals, and the
# gap was breaking cognify attempts at higher budgets.
os.environ.setdefault("LLM_RATE_LIMIT_TOKENS", "3400")

# Embeddings: local fastembed (Groq has no embedding models; no OpenAI anywhere).
os.environ.setdefault("EMBEDDING_PROVIDER", "fastembed")
os.environ.setdefault("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
