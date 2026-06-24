"use client";

import type { RoleInfo } from "@/lib/types";
import { Button } from "./ui/button";

export function RoleSwitcher({
  roles,
  value,
  onChange,
}: {
  roles: RoleInfo[];
  value: string;
  onChange: (role: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-stone-100 p-1 ring-1 ring-stone-200/70">
      {roles
        .filter((r) => r.role !== "admin")
        .map((r) => (
          <Button
            key={r.role}
            variant="ghost"
            onClick={() => onChange(r.role)}
            className={`rounded-full px-3.5 py-1 text-[13px] font-medium capitalize transition-all ${
              value === r.role
                ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/80"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {r.role}
          </Button>
        ))}
    </div>
  );
}
