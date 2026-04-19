import type { RecipeSummary } from "@/lib/types";

import { RecipeCard } from "./recipe-card";

export function RecipeGrid({ items }: { items: RecipeSummary[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
        No recipes yet. Import one from a URL to get started.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}
