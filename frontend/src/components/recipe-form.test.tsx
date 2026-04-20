import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RecipeForm } from "./recipe-form";

function sectionByHeading(name: RegExp) {
  const heading = screen.getByRole("heading", { name });
  const section = heading.closest("section");
  if (!section) throw new Error(`no section for ${name}`);
  return within(section);
}

describe("RecipeForm", () => {
  it("submits tag strings as an array and coerces numeric fields", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<RecipeForm submitLabel="Create" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Title/), "Omelette");
    await user.type(screen.getByLabelText(/Servings/), "2");
    await user.type(screen.getByLabelText(/Tags/), "breakfast, quick");

    const ingredients = sectionByHeading(/Ingredients/);
    await user.click(ingredients.getByRole("button", { name: /Add/ }));
    await user.type(screen.getByPlaceholderText("Name"), "eggs");

    const instructions = sectionByHeading(/Instructions/);
    await user.click(instructions.getByRole("button", { name: /Add/ }));
    const stepText = document.querySelector(
      'textarea[name="instructions.0.text"]',
    ) as HTMLTextAreaElement;
    await user.type(stepText, "Beat and cook");

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const values = onSubmit.mock.calls[0][0];
    expect(values.title).toBe("Omelette");
    expect(values.servings).toBe(2);
    expect(values.tags).toEqual(["breakfast", "quick"]);
    expect(values.ingredients).toHaveLength(1);
    expect(values.ingredients[0].name).toBe("eggs");
    expect(values.instructions).toHaveLength(1);
    expect(values.instructions[0].step).toBe(1);
    expect(values.instructions[0].text).toBe("Beat and cook");
  });

  it("does not submit when title is empty", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RecipeForm submitLabel="Create" onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
