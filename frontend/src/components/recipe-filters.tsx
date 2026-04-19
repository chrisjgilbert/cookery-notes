"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import type { SortKey, SortOrder } from "@/lib/types";

interface Props {
  value: {
    q: string;
    cuisine: string;
    course: string;
    sort: SortKey;
    order: SortOrder;
  };
  onChange: (next: Props["value"]) => void;
}

export function RecipeFilters({ value, onChange }: Props) {
  const [q, setQ] = useState(value.q);

  useEffect(() => {
    const id = setTimeout(() => {
      if (q !== value.q) onChange({ ...value, q });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="sticky top-14 z-[5] -mx-4 mb-4 border-b border-neutral-200 bg-neutral-50/90 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or ingredient…"
            className="w-full rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <input
          value={value.cuisine}
          onChange={(e) => onChange({ ...value, cuisine: e.target.value })}
          placeholder="Cuisine"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm sm:w-32"
        />
        <input
          value={value.course}
          onChange={(e) => onChange({ ...value, course: e.target.value })}
          placeholder="Course"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm sm:w-32"
        />
        <select
          value={`${value.sort}:${value.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split(":") as [SortKey, SortOrder];
            onChange({ ...value, sort, order });
          }}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="created_at:desc">Newest</option>
          <option value="created_at:asc">Oldest</option>
          <option value="title:asc">Title A-Z</option>
          <option value="title:desc">Title Z-A</option>
          <option value="total_time_minutes:asc">Fastest</option>
          <option value="total_time_minutes:desc">Slowest</option>
        </select>
      </div>
    </div>
  );
}
