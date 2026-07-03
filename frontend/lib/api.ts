import type { AskResponse, GraphSnapshot } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`${path} failed (${res.status}): ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export function getGraph(): Promise<GraphSnapshot> {
  return request<GraphSnapshot>("/graph");
}

export function askQuestion(question: string, batchCutoff?: string): Promise<AskResponse> {
  return request<AskResponse>("/ask", {
    method: "POST",
    body: JSON.stringify({ question, batch_cutoff: batchCutoff ?? null }),
  });
}
