"use client";

import { Tooltip } from "./Tooltip";
import { levelColor } from "@/lib/ui";
import { Button } from "./ui/button";

/**
 * Compact RBAC affordance for the header: a small shield pill showing the
 * clearance count, with a hover-card that explains RBAC and lists the access
 * levels the current role can read. Keeps the header tidy vs. inline chips.
 */
export function RbacBadge({ role, clearances }: { role: string; clearances: string[] }) {
  if (clearances.length === 0) return null;

  return (
    <Tooltip
      side="bottom"
      align="right"
      width="w-80"
      content={
        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-stone-800">Role-based access control</p>
          <p>
            You&apos;re acting as <span className="font-medium capitalize text-stone-700">{role}</span>.
            Retrieval is filtered to these access levels <em>before</em> search runs — documents
            above your clearance are never retrieved, so the model can&apos;t see them.
          </p>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {clearances.map((c) => (
              <span
                key={c}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${levelColor(c)}`}
              >
                {c}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-stone-400">
            Switch roles above to watch what&apos;s retrievable change in real time.
          </p>
        </div>
      }
    >
      <Button
        type="button"
        variant="outline"
        className="rounded-full cursor-help"
      >
        <ShieldIcon />
        <span>
          {clearances.length} clearance{clearances.length === 1 ? "" : "s"}
        </span>
      </Button>
    </Tooltip>
  );
}

function ShieldIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-indigo-500">
      <path
        d="M12 3l7 3v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
