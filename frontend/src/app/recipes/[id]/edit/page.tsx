"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { NavBar } from "@/components/nav-bar";
import { RecipeForm } from "@/components/recipe-form";
import { useRecipe, useUpdateRecipe } from "@/lib/queries";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading } = useRecipe(id);
  const update = useUpdateRecipe(id);

  if (isLoading || !recipe) {
    return (
      <>
        <NavBar />
        <div className="mx-auto max-w-3xl px-4 py-12 text-center text-neutral-500">
          Loading…
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6">
        <h1 className="mb-4 text-2xl font-semibold">Edit recipe</h1>
        <RecipeForm
          defaultValues={recipe}
          submitLabel="Save changes"
          submitting={update.isPending}
          onSubmit={async (values) => {
            try {
              await update.mutateAsync(values);
              toast.success("Saved");
              router.push(`/recipes/${id}`);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to save");
            }
          }}
        />
      </main>
    </div>
  );
}
