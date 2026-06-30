"use client";

import clsx from "clsx";
import { SlidersHorizontal } from "lucide-react";
import { quickFilters, type QuickFilter } from "@/lib/labels";

export function FilterChips({
  activeFilter,
  onChange,
  className
}: {
  activeFilter: QuickFilter | null;
  onChange: (filter: QuickFilter | null) => void;
  className?: string;
}) {
  return (
    <div className={clsx("flex gap-2 overflow-x-auto pb-1 hide-scrollbar", className)}>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={clsx(
          "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold",
          !activeFilter
            ? "border-app-accent bg-app-accent text-app-accentText"
            : "border-app-stroke bg-app-card text-app-muted"
        )}
      >
        <SlidersHorizontal size={16} />
        Все
      </button>
      {quickFilters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(activeFilter === filter ? null : filter)}
          className={clsx(
            "h-10 shrink-0 rounded-lg border px-3 text-sm font-semibold",
            activeFilter === filter
              ? "border-app-accent bg-app-accent text-app-accentText"
              : "border-app-stroke bg-app-card text-app-muted"
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
