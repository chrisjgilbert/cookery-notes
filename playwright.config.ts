import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `bin/rails runner "Recipe.delete_all" && bin/vite build && bin/rails server -b 127.0.0.1 -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      APP_PASSWORD: "e2e-secret",
      ANTHROPIC_API_KEY: "test",
      JINA_READER_BASE: "http://jina.test",
      RAILS_ENV: "development",
      E2E_FAKE_SERVICES: "1",
    },
  },
});
