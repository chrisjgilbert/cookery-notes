"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ImportForm } from "@/components/import-form";
import { NavBar } from "@/components/nav-bar";
import { RecipeForm } from "@/components/recipe-form";
import { useCreateRecipe } from "@/lib/queries";

export default function NewRecipePage() {
  const params = useSearchParams();
  const manual = params.get("manual") === "1";
  const router = useRouter();
  const createRecipe = useCreateRecipe();

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6">
        <h1 className="mb-4 text-2xl font-semibold">
          {manual ? "Add recipe manually" : "Import from URL"}
        </h1>
        {manual ? (
          <RecipeForm
            submitLabel="Create recipe"
            submitting={createRecipe.isPending}
            onSubmit={async (values) => {
              try {
                const recipe = await createRecipe.mutateAsync(values);
                router.push(`/recipes/${recipe.id}`);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save");
              }
            }}
          />
        ) : (
          <>
            <ImportForm />
            <p className="mt-6 text-sm text-neutral-500">
              Or{" "}
              <a href="/recipes/new?manual=1" className="text-brand-600 underline">
                add manually
              </a>
              .
            </p>
          </>
        )}
      </main>
    </div>
  );
}
