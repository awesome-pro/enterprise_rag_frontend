"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Citation } from "@/lib/types";
import { levelColor } from "@/lib/ui";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  cached?: string | false;
  similarity?: number | null;
  blocked?: boolean;
  error?: boolean;
  flags?: string[];
  streaming?: boolean;
  status?: string;
}

export function Message({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-stone-800 px-4 py-2.5 text-sm text-white shadow-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  const alert = msg.blocked || msg.error;

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] space-y-2.5">
        <div
          className={`rounded-2xl rounded-bl-md px-4 py-3 text-sm ${
            alert
              ? "border border-red-200 bg-red-50 text-red-900"
              : "card-soft text-stone-800"
          }`}
        >
          {msg.blocked && (
            <div className="mb-1 text-xs font-semibold text-red-600">⛔ Blocked by input guardrail</div>
          )}
          {msg.error && (
            <div className="mb-1 text-xs font-semibold text-red-600">⚠️ Request failed</div>
          )}
          {msg.content ? (
            <div className="prose-rag text-stone-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          ) : (
            <span className="inline-flex items-center gap-2 text-stone-400">
              <span className="inline-flex gap-1">
                <Dot /> <Dot /> <Dot />
              </span>
              {msg.status && <span className="text-xs text-stone-500">{msg.status}</span>}
            </span>
          )}
          {msg.streaming && msg.content && (
            <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse rounded-full bg-indigo-400 align-middle" />
          )}
        </div>

        {(msg.cached || (msg.flags && msg.flags.length > 0)) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {msg.cached && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                ⚡ {msg.cached} cache{msg.similarity ? ` · ${(msg.similarity * 100).toFixed(1)}%` : ""}
              </span>
            )}
            {msg.flags?.map((f) => (
              <span
                key={f}
                className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {msg.citations && msg.citations.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
              Sources
            </div>
            <div className="flex flex-col gap-1.5">
              {msg.citations.map((c) => (
                <div
                  key={c.n}
                  className="card-soft flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-shadow hover:shadow-md"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-stone-100 font-mono text-[11px] text-stone-500">
                    {c.n}
                  </span>
                  <span className="font-medium text-stone-700">{c.title}</span>
                  {c.heading && <span className="truncate text-stone-400">› {c.heading}</span>}
                  <span
                    className={`ml-auto shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${levelColor(c.access_level)}`}
                  >
                    {c.access_level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-300" />;
}
