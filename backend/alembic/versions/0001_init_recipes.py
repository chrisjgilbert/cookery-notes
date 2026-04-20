"""init recipes table

Revision ID: 0001_init_recipes
Revises:
Create Date: 2026-04-19

"""
from alembic import op


revision = "0001_init_recipes"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.execute(
        """
        CREATE TABLE recipes (
            id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title               TEXT        NOT NULL,
            source_url          TEXT,
            source_site         TEXT,
            description         TEXT,
            image_url           TEXT,
            prep_time_minutes   INTEGER,
            cook_time_minutes   INTEGER,
            total_time_minutes  INTEGER,
            servings            INTEGER,
            ingredients         JSONB       NOT NULL DEFAULT '[]'::jsonb,
            instructions        JSONB       NOT NULL DEFAULT '[]'::jsonb,
            tags                TEXT[]      NOT NULL DEFAULT '{}',
            cuisine             TEXT,
            course              TEXT,
            difficulty          TEXT,
            notes               TEXT,
            search_tsv          TSVECTOR,
            created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )

    op.execute(
        """
        CREATE OR REPLACE FUNCTION recipes_search_tsv_refresh() RETURNS trigger AS $$
        DECLARE
            ingredient_text TEXT;
        BEGIN
            SELECT coalesce(string_agg(elem->>'name', ' '), '')
            INTO ingredient_text
            FROM jsonb_array_elements(NEW.ingredients) AS elem;

            NEW.search_tsv :=
                setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
                setweight(to_tsvector('english', ingredient_text), 'C');
            NEW.updated_at := now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )

    op.execute(
        """
        CREATE TRIGGER trg_recipes_search_tsv
        BEFORE INSERT OR UPDATE ON recipes
        FOR EACH ROW EXECUTE FUNCTION recipes_search_tsv_refresh();
        """
    )

    op.execute("CREATE INDEX recipes_search_tsv_idx ON recipes USING GIN (search_tsv)")
    op.execute("CREATE INDEX recipes_tags_gin_idx ON recipes USING GIN (tags)")
    op.execute("CREATE INDEX recipes_cuisine_idx ON recipes (cuisine)")
    op.execute("CREATE INDEX recipes_course_idx ON recipes (course)")
    op.execute("CREATE INDEX recipes_created_at_idx ON recipes (created_at DESC)")
    op.execute(
        "CREATE INDEX recipes_title_trgm_idx ON recipes USING GIN (title gin_trgm_ops)"
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_recipes_search_tsv ON recipes")
    op.execute("DROP FUNCTION IF EXISTS recipes_search_tsv_refresh()")
    op.execute("DROP TABLE IF EXISTS recipes")
