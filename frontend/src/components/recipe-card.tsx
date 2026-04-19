import { Clock, Users } from "lucide-react";
import Link from "next/link";

import type { RecipeSummary } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  const time = formatMinutes(recipe.total_time_minutes);
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:border-brand-500 hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full bg-neutral-100">
        {recipe.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            No image
          </div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 font-medium leading-snug">{recipe.title}</h3>
        <div className="flex items-center gap-3 text-xs text-neutral-600">
          {time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {time}
            </span>
          )}
          {recipe.servings != null && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {recipe.servings}
            </span>
          )}
        </div>
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
