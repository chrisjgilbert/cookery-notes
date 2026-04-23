import { useForm } from "@inertiajs/react";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  importError: "not_a_recipe" | "fetch_failed" | null;
}

export function ImportForm({ importError }: Props) {
  const form = useForm({ url: "" });

  useEffect(() => {
    if (importError === "fetch_failed") {
      toast.error("Failed to fetch that URL. Try again or add manually.");
    }
  }, [importError]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    form.post("/recipes/import", { preserveScroll: true });
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
            value={form.data.url}
            onChange={(e) => form.setData("url", e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <Button type="submit" disabled={form.processing || !form.data.url}>
        {form.processing && <Loader2 className="animate-spin" />}
        {form.processing ? "Fetching and extracting…" : "Import"}
      </Button>
      {form.processing && (
        <p className="text-xs text-muted-foreground">
          This usually takes 3–15 seconds while we fetch the page and extract the
          recipe with the LLM.
        </p>
      )}
      {importError === "not_a_recipe" && (
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
