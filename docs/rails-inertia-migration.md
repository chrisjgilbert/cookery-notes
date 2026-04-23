# Rails + Inertia + PWA Rewrite Plan

## Goal

Replace the FastAPI + Next.js monorepo with a single Rails 8 app that serves the same UI via Inertia (React + Tailwind + shadcn/ui retained) and ships as an installable PWA. Same features, same Postgres schema, much less integration glue.

## Branch strategy

- Work on `claude/rails-inertia-rewrite` off `main`.
- Leave the current `claude/recipe-saver-app-V2tPH` branch untouched as a rollback.
- Merge to `main` only after Phase 5 (feature parity) is shippable.
- At merge time: delete `backend/` and `frontend/`, move the Rails app to the repo root.

## Non-goals

- No behavioural changes: same URL extraction flow, same filter/search/sort semantics, same single-password gate.
- No native mobile app — PWA is the mobile story.
- No real-time features, no background jobs beyond the import request itself.
- No multi-user support.

## Target repo layout (at end of rewrite)

```
cookery-notes/
├── Gemfile, Gemfile.lock
├── Rakefile, config.ru
├── bin/, config/, db/, lib/, log/, public/, storage/, tmp/, vendor/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb
│   │   ├── sessions_controller.rb
│   │   ├── recipes_controller.rb
│   │   └── recipes/imports_controller.rb
│   ├── models/recipe.rb
│   ├── services/
│   │   ├── jina_fetcher.rb
│   │   └── recipe_extractor.rb
│   └── frontend/                         # Vite root
│       ├── entrypoints/application.tsx
│       ├── pages/{Login,Recipes/*}.tsx
│       ├── components/                   # ported from frontend/src/components
│       └── lib/utils.ts
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/{192,512,maskable}.png
├── spec/
│   ├── models/recipe_spec.rb
│   ├── services/recipe_extractor_spec.rb
│   ├── requests/recipes_spec.rb
│   └── system/flow_spec.rb               # equivalent to current e2e
├── docs/
│   └── rails-inertia-migration.md        # this file
└── README.md
```

## Phased milestones

Each phase ends with a working commit. Ship-or-stop boundaries.

### Phase 0 — Scaffold (1–2 hours)

- `rails new . --database=postgresql --javascript=vite --skip-test` inside a fresh subdir, then hoist to root on merge.
- Add `inertia_rails`, `vite_rails`, `bcrypt`, `ruby-anthropic`, `faraday`, `rspec-rails`, `webmock`, `vcr`, `dotenv-rails`.
- `bin/rails inertia:install` and `bin/vite install`.
- Wire React + TypeScript + Tailwind (`tailwindcss` via Vite, not `tailwindcss-rails`).
- Copy `tailwind.config.ts`, `components.json`, `globals.css` from `frontend/` with paths rewritten to `app/frontend/`.
- Copy `cn()` helper and shadcn UI components (`button`, `input`, `label`, `textarea`, `select`, `card`, `badge`, `alert-dialog`) into `app/frontend/components/ui/`.

**Verify:** `bin/rails s` + `bin/vite dev` renders a placeholder Inertia page with shadcn styling.

### Phase 1 — DB, model, auth (2–3 hours)

- Migration `db/migrate/*_init_recipes.rb` porting the exact schema from `backend/alembic/versions/0001_init_recipes.py` (UUIDs, JSONB, tags array, tsvector, trigger, pg_trgm + GIN indexes).
- `Recipe` model with serializers for `ingredients`/`instructions` (use `store_accessor` or keep JSONB raw and validate shape in the controller).
- Auth: single `APP_PASSWORD` env var. `SessionsController#create` does `ActiveSupport::SecurityUtils.secure_compare(BCrypt::Password.new(ENV['APP_PASSWORD_HASH']), params[:password])`, sets `session[:authed] = true`.
- `ApplicationController` has `before_action :require_login`, skipped on `SessionsController`.
- Inertia share: `inertia_share authed: -> { session[:authed] == true }`.

**Verify:** RSpec request spec for login success/failure; unauthenticated request to `/` redirects to `/login`.

### Phase 2 — Recipes CRUD via Inertia (3–4 hours)

- `RecipesController#index`/`#show`/`#create`/`#update`/`#destroy` rendering `Recipes/Index`, `Recipes/Show`, `Recipes/New`, `Recipes/Edit`.
- Port `RecipeForm`, `RecipeCard`, `RecipeGrid`, `NavBar` from `frontend/src/components/` (near-zero changes — they're prop-driven already).
- Replace `useCreateRecipe`/`useUpdateRecipe`/`useDeleteRecipe` call sites with `@inertiajs/react` `router.post/patch/delete`. Keep the shadcn `AlertDialog` delete confirmation.
- Toasts via `sonner` triggered from Inertia `flash` props (share `flash: -> { flash.to_h }`).

**Verify:** Manually create → view → edit → delete a recipe. RSpec request specs for each endpoint.

### Phase 3 — Import (Jina + Anthropic) (3–4 hours)

- `JinaFetcher` service: `Faraday.get("#{ENV['JINA_READER_BASE']}/#{url}")` with 2 retries and exponential backoff, returning markdown text. Raise `JinaFetcher::Error` on failure.
- `RecipeExtractor` service: Anthropic tool-use mirroring `backend/app/services/extraction.py`.
  - Model `claude-haiku-4-5-20251001`.
  - Tool: `save_recipe` with the exact JSON schema from `extraction.py`.
  - System prompt with `cache_control: { type: "ephemeral" }`.
  - Force `tool_choice: { type: "tool", name: "save_recipe" }`.
  - Retry once on 529.
  - Raise `RecipeExtractor::NotRecipeError` if the model returns `is_recipe: false`; the controller maps this to 422.
- `Recipes::ImportsController#create`: `url → JinaFetcher → RecipeExtractor → Recipe.create!(...)`, then `redirect_to recipe_path(recipe)` (Inertia handles the client-side nav).
- `ImportForm` component ported — swap `useImportRecipe` for `router.post('/recipes/import', { url })`. The 422 case shows the "not a recipe" inline message; other errors toast.

**Verify:** RSpec `spec/services/recipe_extractor_spec.rb` with WebMock stubbing Anthropic (matches the current Python contract test). End-to-end manual: paste a BBC Good Food URL and check it extracts.

### Phase 4 — Filter/search/sort + pagination (2 hours)

- `RecipesController#index` query:
  - `q` → `search_tsv @@ websearch_to_tsquery('english', ?)` OR `title ILIKE '%q%'` (trigram fallback).
  - `cuisine`, `course` → exact match.
  - `sort` → whitelist `{ created_at: :created_at, title: :title, total_time_minutes: :total_time_minutes }`; `order` → `:asc | :desc`.
  - Pagination: `limit` + `offset`, default 24.
- Return `{ items:, total:, limit:, offset: }` as Inertia props.
- Port `RecipeFilters` (debounced search) — keep the 300ms debounce; Inertia's `router.get` with `preserveState: true, replace: true` handles URL sync.
- "Load more" button triggers `router.get(..., { offset: currentCount }, { preserveState: true, preserveScroll: true })` and appends.

**Verify:** Vitest `recipe-filters.test.tsx` passes with trivial edits. Manual: search debounce works, filters stack, sort dropdown reflects in URL.

### Phase 5 — PWA (2 hours)

- `public/manifest.webmanifest` with name, short_name, `start_url: "/"`, `display: "standalone"`, theme/background colors from the shadcn palette, icon set (192, 512, maskable 512).
- `public/sw.js`:
  - `install`: precache app shell (`/`, `/login`, Vite build hashes).
  - `fetch`: network-first for HTML and Inertia (`X-Inertia`) requests, cache-first for `/vite/assets/*` and images.
  - Cache the last 50 recipe detail pages' Inertia props keyed by URL.
- Register the service worker from `app/frontend/entrypoints/application.tsx` (only in production).
- `<link rel="manifest">` + theme-color `<meta>` in `app/views/layouts/application.html.erb`.
- Add `apple-touch-icon` and `apple-mobile-web-app-capable` meta for iOS home-screen install.

**Verify:** Chrome DevTools Lighthouse PWA audit green. "Install app" prompt appears on desktop Chrome. Add-to-home-screen works on iOS 16.4+ and Android. Offline: previously-viewed recipes still render.

### Phase 6 — Tests + deploy (2–3 hours)

- Backend: RSpec request specs for all controllers, service specs for Jina + extractor (WebMock + VCR cassettes).
- Frontend: Vitest component tests port as-is (they don't know about Inertia). Update `ImportForm` test to mock `router.post` from `@inertiajs/react` instead of `fetch`.
- E2E: port `frontend/e2e/flow.spec.ts` to hit Rails (`webServer` runs `bin/rails s`). Stub Jina + Anthropic via WebMock in a test-only Rails initializer, or use VCR cassettes served through a fixture controller in test env.
- Deploy: Kamal 2 with one service, Postgres managed (Supabase stays, or switch to Neon/Fly Postgres). Secrets via Kamal's envfile: `APP_PASSWORD_HASH`, `ANTHROPIC_API_KEY`, `JINA_READER_BASE`, `SECRET_KEY_BASE`, `DATABASE_URL`.

**Verify:** `bin/rails test` + `npm test` + `npm run test:e2e` all green. `kamal deploy` ships to a VPS; `/` loads with real data.

## File-by-file mapping (current → Rails)

| Current | New | Notes |
|---|---|---|
| `backend/app/services/jina.py` | `app/services/jina_fetcher.rb` | Faraday replaces httpx |
| `backend/app/services/extraction.py` | `app/services/recipe_extractor.rb` | Anthropic Ruby SDK, same tool schema |
| `backend/app/api/v1/recipes.py` | `app/controllers/recipes_controller.rb` | Inertia renders instead of JSON |
| `backend/app/api/v1/auth.py` | `app/controllers/sessions_controller.rb` | Rails session cookie, no JWT |
| `backend/app/core/security.py` | gone | bcrypt + Rails sessions replace custom JWT |
| `backend/alembic/versions/0001_init_recipes.py` | `db/migrate/0001_init_recipes.rb` | 1:1 port, same SQL |
| `backend/app/models/recipe.py` | `app/models/recipe.rb` | ActiveRecord + JSONB |
| `frontend/src/components/ui/*` | `app/frontend/components/ui/*` | Unchanged |
| `frontend/src/components/{recipe-card,recipe-form,recipe-filters,import-form,nav-bar,recipe-grid}.tsx` | `app/frontend/components/*` | Near-zero change |
| `frontend/src/app/page.tsx` | `app/frontend/pages/Recipes/Index.tsx` | Props come from controller |
| `frontend/src/app/recipes/[id]/page.tsx` | `app/frontend/pages/Recipes/Show.tsx` | Same |
| `frontend/src/app/recipes/new/page.tsx` | `app/frontend/pages/Recipes/New.tsx` | Same |
| `frontend/src/app/recipes/[id]/edit/page.tsx` | `app/frontend/pages/Recipes/Edit.tsx` | Same |
| `frontend/src/app/login/page.tsx` | `app/frontend/pages/Login.tsx` | Same |
| `frontend/src/lib/api.ts` | **deleted** | Inertia replaces the HTTP client |
| `frontend/src/lib/queries.ts` | **deleted** | No TanStack Query |
| `frontend/src/components/providers.tsx` | **deleted** | Inertia handles app shell |
| `frontend/src/middleware.ts` | **deleted** | `before_action :require_login` replaces it |
| `frontend/src/lib/types.ts` | optional `app/frontend/types.ts` | Could generate from a Ruby serializer or just declare by hand |
| `frontend/src/lib/utils.ts` | `app/frontend/lib/utils.ts` | Unchanged |
| `frontend/e2e/flow.spec.ts` | `spec/system/flow_spec.rb` **or** kept as Playwright hitting Rails | Pick one — recommend keeping Playwright for parity |
| `frontend/src/**/*.test.tsx` | `app/frontend/**/*.test.tsx` | Unchanged |

## Key mechanics worth nailing down before starting

### Inertia + shadcn + Vite

- Use `vite_rails` (not Shakapacker, not importmaps). React + TS are first-class.
- `app/frontend/entrypoints/application.tsx` calls `createInertiaApp({ resolve: (name) => pages[`./pages/${name}.tsx`] })`.
- The Rails layout includes `<%= vite_client_tag %>`, `<%= vite_javascript_tag 'application' %>`, and `<%= inertia_ssr_head %>` (SSR optional — skip for now).

### Form submits

- `RecipeForm` currently does `handleSubmit(async (values) => onSubmit(values))`. Replace the parent's `onSubmit` with:
  ```ts
  router.post('/recipes', values, { onError: (errs) => toast.error(Object.values(errs)[0]) })
  ```
- Rails returns validation errors via `redirect_to new_recipe_path, inertia: { errors: recipe.errors }` — Inertia exposes them as `errors` prop or the `useForm` hook's `errors`.

### Import flow

- `POST /recipes/import` either:
  - On success: `redirect_to recipe_path(recipe)` (Inertia turns this into a client-side visit to the detail page).
  - On 422 (not a recipe): render `Recipes/New` with an `importError: "not_a_recipe"` prop; the component shows the inline amber box.
  - On Jina failure: render `Recipes/New` with `importError: "fetch_failed"`; toast.

### Auth without a users table

- Single `APP_PASSWORD_HASH` env var generated once: `BCrypt::Password.create("your-password")`.
- No `users` table needed. `session[:authed] = true` is sufficient.
- Rails signed-cookie session store handles everything the custom JWT did — with less code.

### PWA offline strategy

- **App shell**: precached (HTML layout + Vite assets).
- **Recipe list**: network-first, fall back to last-cached JSON props.
- **Recipe detail**: stale-while-revalidate — show cached immediately, refresh in background.
- **Mutations**: require online. Show a toast if `navigator.onLine === false`; don't try to queue.
- **Scope**: single-user app → no need for IndexedDB sync or background sync API.

## Risks and how we mitigate

| Risk | Mitigation |
|---|---|
| Ruby Anthropic SDK less mature than Python's — tool-use shape might differ | Write `RecipeExtractor` spec first, with WebMock stubbing the exact JSON; verify one real call in Phase 3 before porting further |
| Inertia + react-hook-form quirks with field arrays | Keep `useFieldArray` as-is; only the outer submit handler changes. Already proven to work in the Inertia community |
| PWA install on iOS has caveats (Safari requires specific meta tags, no `beforeinstallprompt`) | Test on iOS 16.4+ specifically in Phase 5; document the "Share → Add to Home Screen" path as the install UX on iOS |
| Service worker caching stale Inertia props after deploy | Bust cache on Vite build hash; version the SW with a constant tied to the asset manifest |
| Search tsvector trigger porting bug | Copy the SQL verbatim into the migration; add a model spec that inserts a recipe and asserts `search_tsv` is populated |

## Out of scope (explicit follow-ups)

- Supabase → Neon/Fly Postgres migration (optional; Supabase works fine as a DBaaS).
- Dark mode toggle (tokens are ready; ship a button in a follow-up).
- Push notifications (VAPID + `web-push` gem — Phase 7 if wanted).
- Background jobs for import (Solid Queue is default in Rails 8; useful only if extraction moves off the request cycle).

## Rollback

- Old `claude/recipe-saver-app-V2tPH` branch and its deploy stay alive until the Rails app is in production for a week.
- Database is identical schema, so a `pg_dump` from the old app restores cleanly into either stack.

## Estimated total effort

- Phases 0–6: ~15–20 hours of focused work.
- Biggest single risk to the estimate: Anthropic Ruby SDK tool-use ergonomics. Budget a 2-hour spike in Phase 3 before committing.
