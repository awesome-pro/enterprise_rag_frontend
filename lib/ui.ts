export const LEVEL_COLORS: Record<string, string> = {
  public: "bg-zinc-100 text-zinc-600 border-zinc-200",
  engineering: "bg-blue-50 text-blue-700 border-blue-200",
  finance: "bg-emerald-50 text-emerald-700 border-emerald-200",
  legal: "bg-amber-50 text-amber-700 border-amber-200",
  executive: "bg-violet-50 text-violet-700 border-violet-200",
};

export function levelColor(level: string): string {
  return LEVEL_COLORS[level] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
}

export function fmtMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}
