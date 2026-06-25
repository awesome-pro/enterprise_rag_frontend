"use client";

import type { ReactNode } from "react";
import type { PanelState, Stage } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { fmtMs, levelColor } from "@/lib/ui";
import { HelpTip } from "./Tooltip";

const STAGE_LABELS: Record<string, string> = {
  input_guard: "Input guardrails",
  query_rewrite: "Query rewrite",
  cache_exact: "Exact cache",
  embed_query: "Embed query",
  cache_semantic: "Semantic cache",
  hybrid_retrieval: "Hybrid retrieval",
  rrf_fusion: "RRF fusion",
  rerank: "Rerank (cross-encoder)",
  generation: "Generation (Claude)",
  output_guard: "Output guardrails",
};

function stageDetail(s: Stage): string {
  if (s.name === "hybrid_retrieval")
    return `dense ${s.dense_hits ?? "?"} · bm25 ${s.keyword_hits ?? "?"}`;
  if (s.name === "rrf_fusion") {
    const w = s.weights as { semantic: number; keyword: number } | undefined;
    return w ? `${w.semantic} / ${w.keyword}` : "";
  }
  if (s.name === "rerank") return `${s.in ?? "?"} → ${s.out ?? "?"}`;
  if (s.name.startsWith("cache")) return s.hit ? `hit: ${s.hit}` : "miss";
  if (s.name === "input_guard" || s.name === "output_guard") {
    const flags = (s.flags as string[]) ?? [];
    return flags.length ? flags.join(", ") : "clean";
  }
  if (s.name === "query_rewrite") return s.rewritten ? "rewritten" : "passthrough";
  return "";
}

export function PipelinePanel({ panel }: { panel: PanelState | null }) {
  if (!panel) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-stone-200/70">
          <LayersIcon />
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-stone-400">
          Ask a question to see the retrieval pipeline — RBAC filtering, hybrid
          search, fusion, reranking, caching, and per-stage latency.
        </p>
      </div>
    );
  }

  const stages = panel.trace?.stages ?? panel.stages ?? [];
  const maxMs = Math.max(1, ...stages.map((s) => s.ms));
  // Before rerank finishes, show the fused preview order; after, the final order.
  const results = panel.sources.length > 0 ? panel.sources : panel.preview;
  const resultsLabel = panel.sources.length > 0 ? "Retrieved & reranked" : "Fused (pre-rerank)";

  return (
    <div className="scroll-thin h-full overflow-y-auto p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-stone-500">
            Pipeline internals
          </h2>
          <HelpTip
            side="bottom"
            align="left"
            width="w-80"
            content={
              <p>
                A live trace of how this answer was produced — every stage the
                query ran through, in order, with its latency.
              </p>
            }
          />
        </div>
        {panel.trace ? (
          <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-xs font-medium text-white">
            {fmtMs(panel.trace.total_ms)} total
          </span>
        ) : panel.status ? (
          <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 ring-1 ring-indigo-100">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
            {STATUS_LABELS[panel.status] ?? panel.status}
          </span>
        ) : null}
      </div>

      {/* RBAC clearances */}
      <div className="card-soft mb-4 rounded-xl p-4">
        <Label
          help={
            <p>
              The access levels this role can read. Search is filtered to these
              levels before it runs, so anything above your clearance is never
              retrieved.
            </p>
          }
        >
          RBAC clearances
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {(panel.allowedLevels ?? []).map((l) => (
            <span
              key={l}
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${levelColor(l)}`}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Stage timeline */}
      {stages.length > 0 && (
        <div className="card-soft mb-4 rounded-xl p-4">
          <Label
            help={
              <p>
                Time spent in each stage, in run order. Bars are scaled to the
                slowest stage. On a cache hit, the later stages are skipped.
              </p>
            }
          >
            Stage latency
          </Label>
          <div className="space-y-2.5">
            {stages.map((s) => (
              <div key={s.name} className="text-xs">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-stone-700">
                    {STAGE_LABELS[s.name] ?? s.name}
                  </span>
                  <span className="font-mono text-stone-400">{fmtMs(s.ms)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                    style={{ width: `${(s.ms / maxMs) * 100}%` }}
                  />
                </div>
                {stageDetail(s) && (
                  <div className="mt-1 text-[11px] text-stone-400">{stageDetail(s)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cache hit short-circuit note */}
      {panel.cached && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-700">
          ⚡ Served from <strong>{panel.cached}</strong> cache
          {panel.similarity ? ` (similarity ${(panel.similarity * 100).toFixed(1)}%)` : ""} —
          retrieval &amp; generation skipped.
        </div>
      )}

      {/* Retrieval results: shows fusion + rerank reordering */}
      {results.length > 0 && (
        <div className="card-soft rounded-xl p-4">
          <Label
            helpSide="top"
            help={
              <div className="space-y-1.5">
                <ul className="space-y-1">
                  <li><span className="font-medium text-stone-700">vec</span> — rank in vector search</li>
                  <li><span className="font-medium text-stone-700">bm25</span> — rank in keyword search</li>
                  <li><span className="font-medium text-stone-700">rrf</span> — fused score (0.7 vector + 0.3 keyword)</li>
                  <li><span className="font-medium text-stone-700">rank</span> — cross-encoder score, final order</li>
                </ul>
                <p>Rows are sorted by rank. Compare with vec and bm25 to see what the reranker moved.</p>
              </div>
            }
          >
            {resultsLabel} ({results.length})
          </Label>
          <div className="overflow-hidden rounded-lg border border-stone-200/80">
            <table className="w-full text-[11px]">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-2.5 py-2 text-left font-medium">Source</th>
                  <th className="px-1.5 py-2 text-right font-medium" title="dense (vector) rank">vec</th>
                  <th className="px-1.5 py-2 text-right font-medium" title="BM25 rank">bm25</th>
                  <th className="px-1.5 py-2 text-right font-medium" title="RRF fused score">rrf</th>
                  <th className="px-2.5 py-2 text-right font-medium" title="cross-encoder score">rank</th>
                </tr>
              </thead>
              <tbody>
                {results.map((s, i) => (
                  <tr key={s.chunk_id} className="border-t border-stone-100">
                    <td className="px-2.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-stone-400">{i + 1}</span>
                        <span className="font-medium text-stone-700">{s.title}</span>
                      </div>
                      <div className="truncate text-stone-400">{s.heading || "—"}</div>
                    </td>
                    <td className="px-1.5 text-right font-mono text-stone-500">
                      {s.dense_rank === null ? "—" : `#${s.dense_rank}`}
                    </td>
                    <td className="px-1.5 text-right font-mono text-stone-500">
                      {s.keyword_rank === null ? "—" : `#${s.keyword_rank}`}
                    </td>
                    <td className="px-1.5 text-right font-mono text-stone-500">
                      {s.rrf_score === null ? "—" : s.rrf_score.toFixed(4)}
                    </td>
                    <td className="px-2.5 text-right font-mono font-semibold text-indigo-600">
                      {s.rerank_score === null ? "—" : s.rerank_score.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-stone-400">
            Rows are in final (reranked) order. Compare the vec/bm25 ranks to see
            how fusion + the cross-encoder reordered candidates.
          </p>
        </div>
      )}
    </div>
  );
}

function Label({
  children,
  help,
  helpSide = "bottom",
}: {
  children: ReactNode;
  help?: ReactNode;
  helpSide?: "top" | "bottom";
}) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
      <span>{children}</span>
      {help && <HelpTip content={help} side={helpSide} align="left" width="w-72" />}
    </div>
  );
}

function LayersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-stone-300">
      <path
        d="M12 3l9 5-9 5-9-5 9-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
