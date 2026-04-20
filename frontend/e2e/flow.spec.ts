import { test, expect, type Route } from "@playwright/test";

// Every backend call is stubbed: we never hit FastAPI, Jina, or Claude.
const API = "http://api.test";

const RECIPE = {
  id: "rec_e2e",
  title: "Playwright Pasta",
  source_url: "https://example.com/pasta",
  source_site: "example.com",
  description: "From the E2E suite.",
  image_url: null,
  prep_time_minutes: 5,
  cook_time_minutes: 15,
  total_time_minutes: 20,
  servings: 2,
  ingredients: [
    { quantity: "200", unit: "g", name: "pasta", notes: null },
    { quantity: "2", unit: "tbsp", name: "olive oil", notes: null },
  ],
  instructions: [
    { step: 1, text: "Boil pasta." },
    { step: 2, text: "Toss with oil." },
  ],
  tags: ["quick", "italian"],
  cuisine: "Italian",
  course: "Main",
  difficulty: "easy",
  notes: null,
  created_at: "2026-04-20T12:00:00Z",
  updated_at: "2026-04-20T12:00:00Z",
};

const SUMMARY = {
  id: RECIPE.id,
  title: RECIPE.title,
  image_url: null,
  total_time_minutes: RECIPE.total_time_minutes,
  servings: RECIPE.servings,
  tags: RECIPE.tags,
  cuisine: RECIPE.cuisine,
  course: RECIPE.course,
  created_at: RECIPE.created_at,
};

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

test("login -> import -> list -> delete", async ({ page, context }) => {
  // Track mutable server-side state inside the test.
  let recipes = [] as typeof SUMMARY[];
  let imported = false;

  await context.route(`${API}/api/v1/auth/login`, async (route) => {
    // Simulate the session cookie being set. Playwright's CORS-safe context
    // can't Set-Cookie across origins, so set it directly on the browser.
    await context.addCookies([
      {
        name: "session",
        value: "fake.jwt.value",
        domain: "127.0.0.1",
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ]);
    return json(route, { ok: true });
  });

  await context.route(`${API}/api/v1/recipes/import`, (route) => {
    imported = true;
    recipes = [SUMMARY];
    return json(route, RECIPE);
  });

  await context.route(/\/api\/v1\/recipes\?.*/, (route) =>
    json(route, {
      items: recipes,
      total: recipes.length,
      limit: 24,
      offset: 0,
    }),
  );

  await context.route(`${API}/api/v1/recipes/${RECIPE.id}`, (route) => {
    if (route.request().method() === "DELETE") {
      recipes = [];
      return route.fulfill({ status: 204, body: "" });
    }
    return json(route, RECIPE);
  });

  // 1. Login
  await page.goto("/login");
  await page.getByLabel("Password").fill("hunter2");
  await page.getByRole("button", { name: /sign in/i }).click();

  // 2. Import from the "new recipe" page
  await expect(page).toHaveURL("/");
  await expect(page.getByText(/no recipes yet/i)).toBeVisible();
  await page.goto("/recipes/new");
  await page.getByLabel("Recipe URL").fill("https://example.com/pasta");
  await page.getByRole("button", { name: /^import$/i }).click();

  // 3. Lands on the detail page
  await expect(page).toHaveURL(`/recipes/${RECIPE.id}`);
  await expect(page.getByRole("heading", { name: RECIPE.title })).toBeVisible();
  expect(imported).toBe(true);

  // 4. List shows it
  await page.goto("/");
  await expect(page.getByRole("link", { name: new RegExp(RECIPE.title) })).toBeVisible();
  await expect(page.getByText("1 recipe")).toBeVisible();

  // 5. Delete from the detail page
  await page.getByRole("link", { name: new RegExp(RECIPE.title) }).click();
  await page.getByRole("button", { name: /delete/i }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: /delete/i }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText(/no recipes yet/i)).toBeVisible();
});
