"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import type { RecipeInput } from "@/lib/types";

interface Props {
  defaultValues?: Partial<RecipeInput>;
  submitLabel: string;
  onSubmit: (values: RecipeInput) => Promise<void> | void;
  submitting?: boolean;
}

const EMPTY: RecipeInput = {
  title: "",
  source_url: null,
  source_site: null,
  description: null,
  image_url: null,
  prep_time_minutes: null,
  cook_time_minutes: null,
  total_time_minutes: null,
  servings: null,
  ingredients: [],
  instructions: [],
  tags: [],
  cuisine: null,
  course: null,
  difficulty: null,
  notes: null,
};

export function RecipeForm({ defaultValues, submitLabel, onSubmit, submitting }: Props) {
  const form = useForm<RecipeInput>({
    defaultValues: { ...EMPTY, ...defaultValues },
  });
  const { register, control, handleSubmit } = form;

  const ingredients = useFieldArray({ control, name: "ingredients" });
  const instructions = useFieldArray({ control, name: "instructions" });

  const submit = handleSubmit(async (values) => {
    const tags = typeof (values as unknown as { tags: unknown }).tags === "string"
      ? ((values as unknown as { tags: string }).tags as string)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : values.tags;
    await onSubmit({ ...values, tags });
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required>
          <input
            {...register("title", { required: true })}
            className="form-input"
          />
        </Field>
        <Field label="Source URL">
          <input {...register("source_url")} className="form-input" />
        </Field>
        <Field label="Image URL">
          <input {...register("image_url")} className="form-input" />
        </Field>
        <Field label="Servings">
          <input
            type="number"
            {...register("servings", { valueAsNumber: true })}
            className="form-input"
          />
        </Field>
        <Field label="Prep time (min)">
          <input
            type="number"
            {...register("prep_time_minutes", { valueAsNumber: true })}
            className="form-input"
          />
        </Field>
        <Field label="Cook time (min)">
          <input
            type="number"
            {...register("cook_time_minutes", { valueAsNumber: true })}
            className="form-input"
          />
        </Field>
        <Field label="Total time (min)">
          <input
            type="number"
            {...register("total_time_minutes", { valueAsNumber: true })}
            className="form-input"
          />
        </Field>
        <Field label="Cuisine">
          <input {...register("cuisine")} className="form-input" />
        </Field>
        <Field label="Course">
          <input {...register("course")} className="form-input" />
        </Field>
        <Field label="Difficulty">
          <input {...register("difficulty")} className="form-input" />
        </Field>
      </div>

      <Field label="Description">
        <textarea rows={2} {...register("description")} className="form-input" />
      </Field>

      <Field label="Tags (comma separated)">
        <input
          defaultValue={(defaultValues?.tags ?? []).join(", ")}
          {...register("tags" as never)}
          className="form-input"
        />
      </Field>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">Ingredients</h3>
          <button
            type="button"
            onClick={() =>
              ingredients.append({ quantity: null, unit: null, name: "", notes: null })
            }
            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-12 gap-2">
              <input
                placeholder="Qty"
                {...register(`ingredients.${i}.quantity` as const)}
                className="form-input col-span-2"
              />
              <input
                placeholder="Unit"
                {...register(`ingredients.${i}.unit` as const)}
                className="form-input col-span-2"
              />
              <input
                placeholder="Name"
                {...register(`ingredients.${i}.name` as const, { required: true })}
                className="form-input col-span-4"
              />
              <input
                placeholder="Notes"
                {...register(`ingredients.${i}.notes` as const)}
                className="form-input col-span-3"
              />
              <button
                type="button"
                onClick={() => ingredients.remove(i)}
                className="col-span-1 flex items-center justify-center rounded-md border border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                aria-label="Remove ingredient"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">Instructions</h3>
          <button
            type="button"
            onClick={() =>
              instructions.append({ step: instructions.fields.length + 1, text: "" })
            }
            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {instructions.fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-12 gap-2">
              <input
                type="number"
                {...register(`instructions.${i}.step` as const, {
                  valueAsNumber: true,
                  required: true,
                })}
                className="form-input col-span-1"
              />
              <textarea
                rows={2}
                {...register(`instructions.${i}.text` as const, { required: true })}
                className="form-input col-span-10"
              />
              <button
                type="button"
                onClick={() => instructions.remove(i)}
                className="col-span-1 flex items-center justify-center rounded-md border border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                aria-label="Remove step"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <Field label="Notes">
        <textarea rows={3} {...register("notes")} className="form-input" />
      </Field>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>

      <style jsx global>{`
        .form-input {
          @apply w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </span>
      {children}
    </label>
  );
}
