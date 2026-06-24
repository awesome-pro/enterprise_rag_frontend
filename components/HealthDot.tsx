"use client";

import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";

type Status = "checking" | "online" | "offline";

const STYLES: Record<Status, { dot: string; text: string }> = {
  checking: { dot: "bg-zinc-300 animate-pulse", text: "text-zinc-400" },
  online: { dot: "bg-emerald-500", text: "text-emerald-600" },
  offline: { dot: "bg-red-500", text: "text-red-600" },
};

/** Polls /health every 5s so a dead/stale backend is obvious at a glance. */
export function HealthDot() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;
    const ping = async () => {
      const ok = await checkHealth();
      if (active) setStatus(ok ? "online" : "offline");
    };
    ping();
    const id = setInterval(ping, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const s = STYLES[status];
  return (
    <span
      className={`flex items-center gap-1.5 text-[11px] font-medium ${s.text}`}
      title={status === "offline" ? "Run `make api` on :8001" : undefined}
    >
      <span className={`size-2 rounded-full ${s.dot}`} />
    </span>
  );
}
