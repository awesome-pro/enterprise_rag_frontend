export type Role = string;

export interface RoleInfo {
  role: string;
  clearances: string[];
}

export interface SourceBrief {
  chunk_id: string;
  title: string;
  heading: string;
  access_level: string;
  dense_rank: number | null;
  keyword_rank: number | null;
  rrf_score: number | null;
  rerank_score: number | null;
}

export interface Stage {
  name: string;
  ms: number;
  [key: string]: unknown;
}

export interface Trace {
  query: string;
  user_role: string;
  total_ms: number;
  stages: Stage[];
  allowed_levels?: string[];
}

export interface Citation {
  n: number;
  chunk_id: string;
  doc_id: string;
  title: string;
  heading: string;
  access_level: string;
}

export interface FinalEvent {
  type: "final";
  answer: string;
  citations: Citation[];
  cached?: string | false;
  similarity?: number | null;
  blocked?: boolean;
  grounded?: boolean;
  flags?: string[];
  trace: Trace;
}

export interface PanelState {
  sources: SourceBrief[];
  preview: SourceBrief[];
  stages: Stage[];
  status: string | null;
  trace: Trace | null;
  cached: string | false;
  similarity?: number | null;
  flags: string[];
  blocked: boolean;
  allowedLevels: string[];
}

export const STATUS_LABELS: Record<string, string> = {
  embed_query: "Embedding query…",
  hybrid_retrieval: "Searching (vector + BM25)…",
  rerank: "Reranking candidates…",
  generation: "Generating answer…",
};
