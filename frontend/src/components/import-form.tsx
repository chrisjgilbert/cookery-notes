"use client";

import { Link as LinkIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { useImportRecipe } from "@/lib/queries";

export function ImportForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [notRecipeError, setNotRecipeError] = useState(false);
  const mutation = useImportRecipe();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotRecipeError(false);
    try {
      const recipe = await mutation.mutateAsync(url);
      router.push(`/recipes/${recipe.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setNotRecipeError(true);
      } else {
        toast.error(err instanceof Error ? err.message : "Import failed");
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Recipe URL</span>
        <div className="relative">
          <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="url"
            required
            placeholder="https://www.bbcgoodfood.com/recipes/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </label>
      <button
        type="submit"
        disabled={mutation.isPending || !url}
        className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {mutation.isPending ? "Fetching and extracting…" : "Import"}
      </button>
      {mutation.isPending && (
        <p className="text-xs text-neutral-500">
          This usually takes 3–15 seconds while we fetch the page and extract the
          recipe with the LLM.
        </p>
      )}
      {notRecipeError && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          That URL doesn&apos;t look like a recipe page.{" "}
          <a href="/recipes/new?manual=1" className="font-medium underline">
            Add manually
          </a>
          .
        </div>
      )}
    </form>
  );
}
