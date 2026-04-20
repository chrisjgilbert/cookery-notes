"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="sticky top-14 z-[5] -mx-4 mb-4 border-b bg-background/90 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or ingredient…"
            className="pl-9"
          />
        </div>
        <Input
          value={value.cuisine}
          onChange={(e) => onChange({ ...value, cuisine: e.target.value })}
          placeholder="Cuisine"
          className="sm:w-32"
        />
        <Input
          value={value.course}
          onChange={(e) => onChange({ ...value, course: e.target.value })}
          placeholder="Course"
          className="sm:w-32"
        />
        <Select
          value={`${value.sort}:${value.order}`}
          onValueChange={(v) => {
            const [sort, order] = v.split(":") as [SortKey, SortOrder];
            onChange({ ...value, sort, order });
          }}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at:desc">Newest</SelectItem>
            <SelectItem value="created_at:asc">Oldest</SelectItem>
            <SelectItem value="title:asc">Title A-Z</SelectItem>
            <SelectItem value="title:desc">Title Z-A</SelectItem>
            <SelectItem value="total_time_minutes:asc">Fastest</SelectItem>
            <SelectItem value="total_time_minutes:desc">Slowest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
