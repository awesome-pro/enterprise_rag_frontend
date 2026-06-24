"use client";

import type { ReactNode } from "react";

/**
 * Lightweight hover tooltip / hover-card. No deps — pure CSS group-hover.
 * Use for short text or rich guidance content. `side`/`align` control placement.
 */
export function Tooltip({
  content,
  children,
  side = "bottom",
  align = "center",
  width = "w-64",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  align?: "center" | "left" | "right";
  width?: string;
}) {
  const sideCls = side === "top" ? "bottom-full mb-2" : "top-full mt-2";
  const alignCls =
    align === "left"
      ? "left-0"
      : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 ${sideCls} ${alignCls} ${width} rounded-xl border border-stone-200 bg-white p-3 text-left text-xs leading-relaxed text-stone-600 opacity-0 shadow-lg transition-opacity duration-150 group-hover/tt:opacity-100`}
      >
        {content}
      </span>
    </span>
  );
}

/** A small "?" help affordance that reveals guidance on hover. */
export function HelpTip({
  content,
  side = "bottom",
  align = "left",
  width = "w-72",
}: {
  content: ReactNode;
  side?: "top" | "bottom";
  align?: "center" | "left" | "right";
  width?: string;
}) {
  return (
    <Tooltip content={content} side={side} align={align} width={width}>
      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-stone-300 text-[10px] font-semibold leading-none text-stone-400 transition-colors hover:border-stone-400 hover:text-stone-600">
        ?
      </span>
    </Tooltip>
  );
}
