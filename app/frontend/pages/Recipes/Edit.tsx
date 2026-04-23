import { router } from "@inertiajs/react";

import { NavBar } from "@/components/nav-bar";
import { RecipeForm } from "@/components/recipe-form";
import type { Recipe, RecipeInput } from "@/lib/types";

export default function RecipesEdit({ recipe }: { recipe: Recipe }) {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6">
        <h1 className="mb-4 text-2xl font-semibold">Edit recipe</h1>
        <RecipeForm
          defaultValues={recipe}
          submitLabel="Save changes"
          onSubmit={(values: RecipeInput) => {
            router.patch(`/recipes/${recipe.id}`, { recipe: values } as never);
          }}
        />
      </main>
    </div>
  );
}
