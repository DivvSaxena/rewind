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

# Embeddings: local fastembed (Groq has no embedding models; no OpenAI anywhere).
os.environ.setdefault("EMBEDDING_PROVIDER", "fastembed")
os.environ.setdefault("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
