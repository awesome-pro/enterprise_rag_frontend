"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { DemoNotice } from "@/components/DemoNotice";
import { HealthDot } from "@/components/HealthDot";
import type { ChatMessage } from "@/components/Message";
import { PipelinePanel } from "@/components/PipelinePanel";
import { RbacBadge } from "@/components/RbacBadge";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { fetchRoles, streamQuery } from "@/lib/api";
import { STATUS_LABELS } from "@/lib/types";
import type { FinalEvent, PanelState, RoleInfo, SourceBrief, Stage } from "@/lib/types";

export default function Home() {
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [role, setRole] = useState("engineer");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [panel, setPanel] = useState<PanelState | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  const clearances = roles.find((r) => r.role === role)?.clearances ?? [];

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setPanel(null);
    setInput("");
    setLoading(false);
  }, []);

  const send = useCallback(
    async (q: string) => {
      if (loading) return;
      setLoading(true);
      setInput("");

      const history = messages
        .filter((m) => !m.blocked)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [
        ...prev,
        { role: "user", content: q },
        { role: "assistant", content: "", streaming: true },
      ]);

      const clearances = roles.find((r) => r.role === role)?.clearances ?? [];
      setPanel({
        sources: [],
        preview: [],
        stages: [],
        status: null,
        trace: null,
        cached: false,
        flags: [],
        blocked: false,
        allowedLevels: clearances,
      });

      const patchAssistant = (patch: Partial<ChatMessage>) =>
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, ...patch };
          return next;
        });

      const ac = new AbortController();
      abortRef.current = ac;

      try {
        await streamQuery({ query: q, role, history }, (event, data) => {
          if (event === "status") {
            setPanel((p) => (p ? { ...p, status: data.stage as string } : p));
            patchAssistant({ status: STATUS_LABELS[data.stage] ?? data.stage });
          } else if (event === "stage") {
            setPanel((p) =>
              p ? { ...p, stages: [...p.stages, data as Stage] } : p,
            );
          } else if (event === "candidates_preview") {
            setPanel((p) =>
              p ? { ...p, preview: data.candidates as SourceBrief[] } : p,
            );
          } else if (event === "sources") {
            setPanel((p) =>
              p ? { ...p, sources: data.candidates as SourceBrief[], status: null } : p,
            );
          } else if (event === "token") {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              next[next.length - 1] = { ...last, content: last.content + data.text };
              return next;
            });
          } else if (event === "final") {
            const f = data as FinalEvent;
            patchAssistant({
              content: f.answer,
              citations: f.citations,
              cached: f.cached ?? false,
              similarity: f.similarity ?? null,
              blocked: f.blocked ?? false,
              flags: f.flags ?? [],
              streaming: false,
            });
            setPanel((p) =>
              p
                ? {
                    ...p,
                    trace: f.trace,
                    stages: f.trace?.stages ?? p.stages,
                    status: null,
                    cached: f.cached ?? false,
                    similarity: f.similarity ?? null,
                    flags: f.flags ?? [],
                    blocked: f.blocked ?? false,
                    allowedLevels: f.trace?.allowed_levels ?? p.allowedLevels,
                  }
                : p,
            );
          }
        }, ac.signal);
      } catch (err) {
        // User started a new chat / navigated away — not an error to surface.
        if (err instanceof DOMException && err.name === "AbortError") return;
        const detail = err instanceof Error ? err.message : String(err);
        const isRateLimit = err instanceof Error && err.name === "RateLimitError";
        patchAssistant({
          content: isRateLimit
            ? `⏳ ${detail}`
            : `Could not get a response from the backend on :8001.\n\n\`${detail}\`\n\nMake sure \`make api\` is running and healthy (and that no stale server is squatting on the port).`,
          streaming: false,
          error: true,
        });
        setPanel((p) => (p ? { ...p, status: null } : p));
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, role, roles],
  );

  return (
    <div className="flex h-screen flex-col">
      <header className="z-10 flex items-center justify-between border-b border-stone-200/70 bg-white/80 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-semibold tracking-tight text-stone-800">
            Nimbus Knowledge
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={newChat}
            disabled={messages.length === 0 && !loading}
            title="Start a new chat"
            className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 shadow-sm transition-colors hover:border-stone-300 hover:text-stone-900 disabled:opacity-40 disabled:hover:border-stone-200 disabled:hover:text-stone-600"
          >
            <PlusIcon />
            New chat
          </button>
          <span className="h-5 w-px bg-stone-200" />
          <HealthDot />
          <RoleSwitcher roles={roles} value={role} onChange={setRole} />
          <RbacBadge role={role} clearances={clearances} />
        </div>
      </header>

      

      <main className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
        <section className="min-h-0 border-r border-stone-200/70 bg-[var(--background)]">
          <ChatPanel
            messages={messages}
            input={input}
            setInput={setInput}
            onSubmit={send}
            loading={loading}
          />
        </section>
        <section className="hidden min-h-0 bg-stone-100/40 lg:block">
          <PipelinePanel panel={panel} />
        </section>
      </main>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-stone-500">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
