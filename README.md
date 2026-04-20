# Cookery Notes

A personal recipe saver: paste a URL, have an LLM extract structured recipe data, and browse a searchable, filterable, sortable library.

Monorepo with two services:

- `backend/` — FastAPI + SQLAlchemy (async) + Supabase Postgres. Uses Jina Reader to fetch pages as markdown and Anthropic Claude (tool use) to extract structured recipes.
- `frontend/` — Next.js 14 (App Router, TypeScript), Tailwind, shadcn/ui, TanStack Query.

## Prerequisites

- Python 3.12+
- Node 20+, pnpm
- A Supabase project (or any Postgres 15+; the DDL is vanilla)
- An Anthropic API key

## One-time setup

Generate an app password hash and a JWT secret:

```bash
python -c "from passlib.hash import bcrypt; print(bcrypt.hash('your-password-here'))"
openssl rand -base64 48
```

Paste both into `backend/.env` (see `backend/.env.example`).

## Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e .
cp .env.example .env    # fill in SUPABASE_DB_URL, ANTHROPIC_API_KEY, APP_PASSWORD_HASH, JWT_SECRET
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

OpenAPI docs: http://localhost:8000/docs

Note on Supabase: use the **direct** connection string (`:5432`) for Alembic, and the **pooler** (`:6543`) for app runtime.

## Frontend

```bash
cd frontend
pnpm install
cp .env.local.example .env.local
pnpm dev    # :3000
```

## Branch

Development branch: `claude/recipe-saver-app-V2tPH`.
