"use client";

import { Clock, ExternalLink, Pencil, Timer, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { NavBar } from "@/components/nav-bar";
import { useDeleteRecipe, useRecipe } from "@/lib/queries";
import { formatMinutes } from "@/lib/utils";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading, isError } = useRecipe(id);
  const del = useDeleteRecipe();
  const [confirming, setConfirming] = useState(false);

  if (isLoading) {
    return (
      <>
        <NavBar />
        <div className="mx-auto max-w-4xl px-4 py-12 text-center text-neutral-500">
          Loading…
        </div>
      </>
    );
  }
  if (isError || !recipe) {
    return (
      <>
        <NavBar />
        <div className="mx-auto max-w-4xl px-4 py-12 text-center text-red-600">
          Recipe not found.
        </div>
      </>
    );
  }

  async function onDelete() {
    if (!recipe) return;
    try {
      await del.mutateAsync(recipe.id);
      toast.success("Recipe deleted");
      router.push("/");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-6">
        {recipe.image_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="mb-6 aspect-[16/9] w-full rounded-lg object-cover"
          />
        )}
        <div className="mb-2 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold">{recipe.title}</h1>
          <div className="flex gap-2">
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            {confirming ? (
              <button
                onClick={onDelete}
                disabled={del.isPending}
                className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Confirm delete
              </button>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        </div>

        {recipe.description && (
          <p className="mb-4 text-neutral-600">{recipe.description}</p>
        )}

        <div className="mb-6 flex flex-wrap gap-3 text-sm text-neutral-700">
          {recipe.total_time_minutes != null && (
            <Chip icon={<Clock className="h-4 w-4" />}>
              Total {formatMinutes(recipe.total_time_minutes)}
            </Chip>
          )}
          {recipe.prep_time_minutes != null && (
            <Chip icon={<Timer className="h-4 w-4" />}>
              Prep {formatMinutes(recipe.prep_time_minutes)}
            </Chip>
          )}
          {recipe.cook_time_minutes != null && (
            <Chip icon={<Timer className="h-4 w-4" />}>
              Cook {formatMinutes(recipe.cook_time_minutes)}
            </Chip>
          )}
          {recipe.servings != null && (
            <Chip icon={<Users className="h-4 w-4" />}>
              Serves {recipe.servings}
            </Chip>
          )}
          {recipe.cuisine && <Chip>{recipe.cuisine}</Chip>}
          {recipe.course && <Chip>{recipe.course}</Chip>}
          {recipe.difficulty && <Chip>{recipe.difficulty}</Chip>}
          {recipe.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700"
            >
              {t}
            </span>
          ))}
        </div>

        {recipe.source_url && (
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            {recipe.source_site ?? "Source"}
          </a>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Ingredients</h2>
            <ul className="space-y-1.5 text-sm">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="border-b border-neutral-100 pb-1.5">
                  <span className="font-medium">
                    {[ing.quantity, ing.unit].filter(Boolean).join(" ")}
                  </span>{" "}
                  {ing.name}
                  {ing.notes && (
                    <span className="text-neutral-500"> — {ing.notes}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((s) => (
                <li key={s.step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                    {s.step}
                  </span>
                  <p className="text-sm leading-relaxed">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {recipe.notes && (
          <section className="mt-8">
            <h2 className="mb-2 text-lg font-semibold">Notes</h2>
            <p className="whitespace-pre-wrap text-sm text-neutral-700">
              {recipe.notes}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function Chip({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs">
      {icon}
      {children}
    </span>
  );
}
