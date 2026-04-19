"""Contract test: mocked Claude tool_use response → RecipeIn round-trip.

Locks the service-layer contract between the Claude tool schema and our Pydantic
models so future prompt or schema edits can't silently drift.
"""
from __future__ import annotations

import os
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

os.environ.setdefault("SUPABASE_DB_URL", "postgresql+asyncpg://x:y@localhost/x")
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-test")
os.environ.setdefault("APP_PASSWORD_HASH", "$2b$12$abcdefghijklmnopqrstuv")
os.environ.setdefault("JWT_SECRET", "test-secret")

from app.schemas.recipe import RecipeIn  # noqa: E402
from app.services import extraction  # noqa: E402


def _tool_use_response(tool_input: dict) -> SimpleNamespace:
    block = SimpleNamespace(type="tool_use", name="save_recipe", input=tool_input)
    usage = SimpleNamespace(
        input_tokens=100,
        output_tokens=50,
        cache_read_input_tokens=0,
        cache_creation_input_tokens=100,
    )
    return SimpleNamespace(content=[block], usage=usage)


@pytest.mark.asyncio
async def test_extract_recipe_round_trips_tool_call_to_recipe_in():
    canned = {
        "is_recipe": True,
        "title": "Easy Chocolate Chip Cookies",
        "description": "A quick weeknight bake.",
        "image_url": "https://example.com/cookie.jpg",
        "prep_time_minutes": 15,
        "cook_time_minutes": 12,
        "total_time_minutes": 27,
        "servings": 12,
        "ingredients": [
            {"quantity": "200", "unit": "g", "name": "flour", "notes": None},
            {"quantity": "100", "unit": "g", "name": "butter", "notes": "softened"},
        ],
        "instructions": [
            {"step": 1, "text": "Preheat oven to 180C."},
            {"step": 2, "text": "Cream butter and sugar."},
        ],
        "tags": ["baking", "dessert", "quick"],
        "cuisine": "british",
        "course": "dessert",
        "difficulty": "easy",
        "notes": None,
    }

    with patch.object(extraction, "AsyncAnthropic") as mock_client_cls:
        instance = mock_client_cls.return_value
        instance.messages = SimpleNamespace(
            create=AsyncMock(return_value=_tool_use_response(canned))
        )
        result = await extraction.extract_recipe(
            "# Easy Chocolate Chip Cookies\n\nSome markdown…",
            "https://www.bbcgoodfood.com/recipes/easy-chocolate-chip-cookies",
        )

    assert isinstance(result, RecipeIn)
    assert result.title == "Easy Chocolate Chip Cookies"
    assert result.source_url == "https://www.bbcgoodfood.com/recipes/easy-chocolate-chip-cookies"
    assert result.source_site == "bbcgoodfood.com"
    assert len(result.ingredients) == 2
    assert result.ingredients[0].name == "flour"
    assert result.instructions[0].step == 1
    assert result.tags == ["baking", "dessert", "quick"]


@pytest.mark.asyncio
async def test_extract_recipe_raises_when_not_a_recipe():
    canned = {
        "is_recipe": False,
        "title": "Not a recipe",
        "ingredients": [],
        "instructions": [],
        "tags": [],
    }

    with patch.object(extraction, "AsyncAnthropic") as mock_client_cls:
        instance = mock_client_cls.return_value
        instance.messages = SimpleNamespace(
            create=AsyncMock(return_value=_tool_use_response(canned))
        )
        with pytest.raises(extraction.ExtractionError):
            await extraction.extract_recipe("news article markdown", "https://bbc.co.uk/news")
