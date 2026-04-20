# Cookery Notes — Backend

FastAPI + async SQLAlchemy + Supabase Postgres. Extracts structured recipes via Jina Reader + Anthropic Claude tool use.

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e .[dev]
cp .env.example .env    # fill in secrets
```

Generate `APP_PASSWORD_HASH`:

```bash
python -c "from passlib.hash import bcrypt; print(bcrypt.hash('your-password'))"
```

Generate `JWT_SECRET`:

```bash
openssl rand -base64 48
```

## Database

Supabase: use the **direct** connection string (`db.<project>.supabase.co:5432`) with `+psycopg2` for `ALEMBIC_DB_URL` (migrations), and the **pooler** connection (`:6543`) with `+asyncpg` for `SUPABASE_DB_URL` (runtime).

Run migrations:

```bash
alembic upgrade head
```

Create a new revision:

```bash
alembic revision -m "description"
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

OpenAPI docs: http://localhost:8000/docs

## Tests

```bash
pytest
```
