"""Load env vars before cognee is imported (cognee reads LLM_* config at import/config time)."""

import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent

# Backend-local .env wins, repo-root .env.local as fallback (dev convenience).
load_dotenv(ROOT / "backend" / ".env")
load_dotenv(ROOT / ".env.local")

# LLM: Groq through cognee's "custom" (litellm) provider.
if os.getenv("GROQ_API_KEY"):
    os.environ.setdefault("LLM_PROVIDER", "custom")
    os.environ.setdefault("LLM_MODEL", "groq/llama-3.3-70b-versatile")
    os.environ.setdefault("LLM_ENDPOINT", "https://api.groq.com/openai/v1")
    os.environ["LLM_API_KEY"] = os.environ["GROQ_API_KEY"]

# Embeddings: Groq has no embedding models, so these stay on OpenAI.
if os.getenv("OPENAI_API_KEY"):
    os.environ.setdefault("EMBEDDING_PROVIDER", "openai")
    os.environ.setdefault("EMBEDDING_MODEL", "openai/text-embedding-3-small")
    os.environ.setdefault("EMBEDDING_API_KEY", os.environ["OPENAI_API_KEY"])
