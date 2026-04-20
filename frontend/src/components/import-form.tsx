"use client";

import { Link as LinkIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="space-y-2">
        <Label htmlFor="import-url">Recipe URL</Label>
        <div className="relative">
          <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="import-url"
            type="url"
            required
            placeholder="https://www.bbcgoodfood.com/recipes/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <Button type="submit" disabled={mutation.isPending || !url}>
        {mutation.isPending && <Loader2 className="animate-spin" />}
        {mutation.isPending ? "Fetching and extracting…" : "Import"}
      </Button>
      {mutation.isPending && (
        <p className="text-xs text-muted-foreground">
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
