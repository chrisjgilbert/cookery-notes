import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db import get_db
from app.schemas.recipe import (
    ImportRequest,
    RecipeIn,
    RecipeListResponse,
    RecipeOut,
    RecipePatch,
    RecipeSummary,
)
from app.services import recipes as recipes_service
from app.services.extraction import ExtractionError, extract_recipe
from app.services.jina import JinaError, fetch_markdown

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.post("/import", response_model=RecipeOut, status_code=status.HTTP_201_CREATED)
async def import_recipe(
    body: ImportRequest,
    db: AsyncSession = Depends(get_db),
    _user: str = Depends(get_current_user),
) -> RecipeOut:
    url = str(body.url)
    try:
        markdown = await fetch_markdown(url)
    except JinaError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))

    if len(markdown) < 200:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Page too short to be a recipe",
        )

    try:
        recipe_in = await extract_recipe(markdown, url)
    except ExtractionError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        )

    recipe = await recipes_service.create_recipe(db, recipe_in)
    return RecipeOut.model_validate(recipe)


@router.get("", response_model=RecipeListResponse)
async def list_recipes(
    db: AsyncSession = Depends(get_db),
    _user: str = Depends(get_current_user),
    q: str | None = None,
    tag: Annotated[list[str] | None, Query()] = None,
    cuisine: str | None = None,
    course: str | None = None,
    sort: str = "created_at",
    order: str = "desc",
    limit: int = Query(default=24, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> RecipeListResponse:
    if sort not in {"created_at", "title", "total_time_minutes"}:
        raise HTTPException(status_code=400, detail="invalid sort")
    if order not in {"asc", "desc"}:
        raise HTTPException(status_code=400, detail="invalid order")

    items, total = await recipes_service.list_recipes(
        db,
        q=q,
        tags=tag,
        cuisine=cuisine,
        course=course,
        sort=sort,  # type: ignore[arg-type]
        order=order,  # type: ignore[arg-type]
        limit=limit,
        offset=offset,
    )
    return RecipeListResponse(
        items=[RecipeSummary.model_validate(r) for r in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{recipe_id}", response_model=RecipeOut)
async def get_recipe(
    recipe_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: str = Depends(get_current_user),
) -> RecipeOut:
    recipe = await recipes_service.get_recipe(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="recipe not found")
    return RecipeOut.model_validate(recipe)


@router.post("", response_model=RecipeOut, status_code=status.HTTP_201_CREATED)
async def create_recipe_manually(
    body: RecipeIn,
    db: AsyncSession = Depends(get_db),
    _user: str = Depends(get_current_user),
) -> RecipeOut:
    recipe = await recipes_service.create_recipe(db, body)
    return RecipeOut.model_validate(recipe)


@router.patch("/{recipe_id}", response_model=RecipeOut)
async def patch_recipe(
    recipe_id: uuid.UUID,
    body: RecipePatch,
    db: AsyncSession = Depends(get_db),
    _user: str = Depends(get_current_user),
) -> RecipeOut:
    recipe = await recipes_service.get_recipe(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="recipe not found")
    updated = await recipes_service.update_recipe(db, recipe, body)
    return RecipeOut.model_validate(updated)


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: str = Depends(get_current_user),
) -> None:
    deleted = await recipes_service.delete_recipe(db, recipe_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="recipe not found")
