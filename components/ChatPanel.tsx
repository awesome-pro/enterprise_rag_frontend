"use client";

import { useEffect, useRef } from "react";
import { Message, type ChatMessage } from "./Message";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const SUGGESTIONS = [
  "How do we handle a SEV-1 incident?",
  "How much PTO do employees get?",
  "What is the Project Horizon acquisition strategy?",
];

export function ChatPanel({
  messages,
  input,
  setInput,
  onSubmit,
  loading,
}: {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  onSubmit: (q: string) => void;
  loading: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="scroll-thin flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100">
                <SparkIcon />
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-stone-800">
                  Ask the Nimbus knowledge base
                </p>
                <p className="mt-1 text-sm text-stone-400">
                  Answers are grounded in retrieved docs and filtered by your role.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s}
                  onClick={() => onSubmit(s)}
                >
                  <span>{s}</span>
                  <span className="text-stone-300 transition-colors group-hover:text-indigo-500">→</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} msg={m} />)
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !loading) onSubmit(input.trim());
        }}
        className="px-6 pb-6 pt-2"
      >
        <div className="card-soft flex items-end gap-2 rounded-2xl p-2 transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-indigo-200">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !loading) onSubmit(input.trim());
              }
            }}
            rows={1}
            placeholder="Ask a question…"
            className="border-none focus-none ring-none"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 disabled:bg-stone-300 disabled:shadow-none"
          >
            {loading ? (
              <span className="inline-flex gap-0.5">
                <Bounce /> <Bounce /> <Bounce />
              </span>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-indigo-500">
      <path
        d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15l-1.6-4.2L6 9.2l4.4-1.6L12 3z"
        fill="currentColor"
      />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function Bounce() {
  return <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/90" />;
}
