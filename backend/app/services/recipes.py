import uuid
from typing import Literal

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recipe import Recipe
from app.schemas.recipe import RecipeIn, RecipePatch

SortKey = Literal["created_at", "title", "total_time_minutes"]
SortOrder = Literal["asc", "desc"]

_SORT_COLUMNS = {
    "created_at": Recipe.created_at,
    "title": Recipe.title,
    "total_time_minutes": Recipe.total_time_minutes,
}


def _recipe_to_kwargs(data: RecipeIn) -> dict:
    return {
        "title": data.title,
        "source_url": data.source_url,
        "source_site": data.source_site,
        "description": data.description,
        "image_url": data.image_url,
        "prep_time_minutes": data.prep_time_minutes,
        "cook_time_minutes": data.cook_time_minutes,
        "total_time_minutes": data.total_time_minutes,
        "servings": data.servings,
        "ingredients": [i.model_dump() for i in data.ingredients],
        "instructions": [s.model_dump() for s in data.instructions],
        "tags": list(data.tags),
        "cuisine": data.cuisine,
        "course": data.course,
        "difficulty": data.difficulty,
        "notes": data.notes,
    }


async def create_recipe(db: AsyncSession, data: RecipeIn) -> Recipe:
    recipe = Recipe(**_recipe_to_kwargs(data))
    db.add(recipe)
    await db.commit()
    await db.refresh(recipe)
    return recipe


async def get_recipe(db: AsyncSession, recipe_id: uuid.UUID) -> Recipe | None:
    return await db.get(Recipe, recipe_id)


async def list_recipes(
    db: AsyncSession,
    *,
    q: str | None = None,
    tags: list[str] | None = None,
    cuisine: str | None = None,
    course: str | None = None,
    sort: SortKey = "created_at",
    order: SortOrder = "desc",
    limit: int = 24,
    offset: int = 0,
) -> tuple[list[Recipe], int]:
    stmt = select(Recipe)
    count_stmt = select(func.count()).select_from(Recipe)

    if q:
        tsq = func.plainto_tsquery("english", q)
        stmt = stmt.where(Recipe.__table__.c.search_tsv.op("@@")(tsq))
        count_stmt = count_stmt.where(Recipe.__table__.c.search_tsv.op("@@")(tsq))
    if tags:
        stmt = stmt.where(Recipe.tags.op("@>")(tags))
        count_stmt = count_stmt.where(Recipe.tags.op("@>")(tags))
    if cuisine:
        stmt = stmt.where(Recipe.cuisine == cuisine)
        count_stmt = count_stmt.where(Recipe.cuisine == cuisine)
    if course:
        stmt = stmt.where(Recipe.course == course)
        count_stmt = count_stmt.where(Recipe.course == course)

    sort_col = _SORT_COLUMNS[sort]
    stmt = stmt.order_by(sort_col.asc() if order == "asc" else sort_col.desc())
    stmt = stmt.limit(limit).offset(offset)

    items_result = await db.execute(stmt)
    total_result = await db.execute(count_stmt)
    return list(items_result.scalars().all()), int(total_result.scalar_one())


async def update_recipe(
    db: AsyncSession, recipe: Recipe, patch: RecipePatch
) -> Recipe:
    data = patch.model_dump(exclude_unset=True)
    if "ingredients" in data and data["ingredients"] is not None:
        data["ingredients"] = [i for i in data["ingredients"]]
    if "instructions" in data and data["instructions"] is not None:
        data["instructions"] = [s for s in data["instructions"]]
    for key, value in data.items():
        setattr(recipe, key, value)
    await db.commit()
    await db.refresh(recipe)
    return recipe


async def delete_recipe(db: AsyncSession, recipe_id: uuid.UUID) -> bool:
    result = await db.execute(delete(Recipe).where(Recipe.id == recipe_id))
    await db.commit()
    return (result.rowcount or 0) > 0
