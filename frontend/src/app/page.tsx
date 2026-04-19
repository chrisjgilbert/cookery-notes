"use client";

import { useState } from "react";

import { NavBar } from "@/components/nav-bar";
import { RecipeFilters } from "@/components/recipe-filters";
import { RecipeGrid } from "@/components/recipe-grid";
import { useRecipes } from "@/lib/queries";
import type { SortKey, SortOrder } from "@/lib/types";

export default function HomePage() {
  const [filters, setFilters] = useState<{
    q: string;
    cuisine: string;
    course: string;
    sort: SortKey;
    order: SortOrder;
  }>({ q: "", cuisine: "", course: "", sort: "created_at", order: "desc" });

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRecipes({
      q: filters.q || undefined,
      cuisine: filters.cuisine || undefined,
      course: filters.course || undefined,
      sort: filters.sort,
      order: filters.order,
    });

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-4">
        <RecipeFilters value={filters} onChange={setFilters} />
        {isLoading && <div className="py-12 text-center text-neutral-500">Loading…</div>}
        {isError && (
          <div className="py-12 text-center text-red-600">
            Failed to load recipes.
          </div>
        )}
        {!isLoading && !isError && (
          <>
            <div className="mb-3 text-sm text-neutral-500">
              {total} {total === 1 ? "recipe" : "recipes"}
            </div>
            <RecipeGrid items={items} />
            {hasNextPage && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
