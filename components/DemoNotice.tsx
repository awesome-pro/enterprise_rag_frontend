"use client";

/**
 * Slim public-demo banner: sets expectations (runs on a cheaper model) and
 * routes interested visitors to a real demo. Kept thin and unobtrusive.
 */
export function DemoNotice() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-b border-amber-200/70 bg-amber-50/80 px-4 py-2 text-center text-xs text-amber-900">
      <span>
        This public demo runs on <strong>Claude Haiku</strong> (fast &amp; low-cost) -
        answers may be rougher than production.
      </span>
      <span className="text-amber-800">
        Want a full-quality walkthrough?{" "}
        <a
          href="mailto:abhinandan@abhinandan.one"
          className="font-semibold underline underline-offset-2 hover:text-amber-950"
        >
          abhinandan@abhinandan.one
        </a>
      </span>
    </div>
  );
}
