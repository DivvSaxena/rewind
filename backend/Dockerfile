# Rewind backend — FastAPI + cognee with the cognified memory baked in.
# Build context expects deploy_data/ (created by export_memory.sh) holding the
# already-ingested cognee databases, so the deployed app boots with the full
# graph and never has to re-cognify on the server.
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc g++ && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the fastembed embedding model into the image so cold starts
# don't pay the ~90MB download.
RUN python -c "from fastembed import TextEmbedding; TextEmbedding('sentence-transformers/all-MiniLM-L6-v2')"

COPY env_setup.py ingest.py graph.py main.py ./
COPY batches.json ./batches.json

# Seeded cognee state (graph + vectors + relational metadata).
COPY deploy_data/data_storage /data/data_storage
COPY deploy_data/cognee_system /data/cognee_system
ENV DATA_ROOT_DIRECTORY=/data/data_storage \
    SYSTEM_ROOT_DIRECTORY=/data/cognee_system

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
