"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";

import { ImportForm } from "@/components/import-form";
import { NavBar } from "@/components/nav-bar";
import { RecipeForm } from "@/components/recipe-form";
import { useCreateRecipe } from "@/lib/queries";

function NewRecipeContent() {
  const params = useSearchParams();
  const manual = params.get("manual") === "1";
  const router = useRouter();
  const createRecipe = useCreateRecipe();

  if (manual) {
    return (
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
    );
  }

  return (
    <>
      <ImportForm />
      <p className="mt-6 text-sm text-muted-foreground">
        Or{" "}
        <a href="/recipes/new?manual=1" className="text-primary underline">
          add manually
        </a>
        .
      </p>
    </>
  );
}

export default function NewRecipePage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6">
        <h1 className="mb-4 text-2xl font-semibold">Add a recipe</h1>
        <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
          <NewRecipeContent />
        </Suspense>
      </main>
    </div>
  );
}
