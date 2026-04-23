import { test, expect } from "@playwright/test";

test("login -> import -> list -> delete", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.getByLabel("Password").fill("e2e-secret");
  await page.getByRole("button", { name: /sign in/i }).click();

  // Root redirects to /; empty state
  await expect(page).toHaveURL("/");
  await expect(page.getByText(/no recipes yet/i)).toBeVisible();

  // Import from /recipes/new
  await page.goto("/recipes/new");
  await page.getByLabel("Recipe URL").fill("https://example.com/pasta");
  await page.getByRole("button", { name: /^import$/i }).click();

  // Lands on the detail page with the extracted title
  await expect(page.getByRole("heading", { name: /Playwright Pasta/ })).toBeVisible({
    timeout: 30_000,
  });

  // Go home: the recipe shows in the grid
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /Playwright Pasta/ }).first(),
  ).toBeVisible();
  await expect(page.getByText("1 recipe")).toBeVisible();

  // Click into it and delete
  await page.getByRole("link", { name: /Playwright Pasta/ }).first().click();
  await page.getByRole("button", { name: /delete/i }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: /delete/i })
    .click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText(/no recipes yet/i)).toBeVisible();
});
