# Cookery Notes — Frontend

Next.js 14 (App Router) + TypeScript + Tailwind + TanStack Query.

## Setup

```bash
pnpm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
pnpm dev
```

Dev server: http://localhost:3000. Routes:

- `/login` — password gate
- `/` — recipe grid with search / filter / sort
- `/recipes/new` — URL import (`?manual=1` for manual entry)
- `/recipes/[id]` — recipe detail
- `/recipes/[id]/edit` — edit form

Session is a cookie issued by the FastAPI backend; `src/middleware.ts` redirects unauthenticated requests to `/login`.
