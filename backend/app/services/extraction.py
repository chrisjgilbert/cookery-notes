from __future__ import annotations

import logging
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from anthropic import AsyncAnthropic
from anthropic._exceptions import APIError
from pydantic import ValidationError

from app.config import get_settings
from app.schemas.recipe import RecipeIn

logger = logging.getLogger(__name__)

MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 2048

_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "recipe_extraction.md"
_SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")

SAVE_RECIPE_TOOL: dict[str, Any] = {
    "name": "save_recipe",
    "description": "Extract a single recipe from the provided markdown of a web page.",
    "input_schema": {
        "type": "object",
        "properties": {
            "is_recipe": {
                "type": "boolean",
                "description": "False if the page does not contain a recipe.",
            },
            "title": {"type": "string"},
            "description": {"type": ["string", "null"]},
            "image_url": {"type": ["string", "null"]},
            "prep_time_minutes": {"type": ["integer", "null"]},
            "cook_time_minutes": {"type": ["integer", "null"]},
            "total_time_minutes": {"type": ["integer", "null"]},
            "servings": {"type": ["integer", "null"]},
            "ingredients": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "quantity": {"type": ["string", "null"]},
                        "unit": {"type": ["string", "null"]},
                        "name": {"type": "string"},
                        "notes": {"type": ["string", "null"]},
                    },
                    "required": ["name"],
                },
            },
            "instructions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "step": {"type": "integer"},
                        "text": {"type": "string"},
                    },
                    "required": ["step", "text"],
                },
            },
            "tags": {"type": "array", "items": {"type": "string"}},
            "cuisine": {"type": ["string", "null"]},
            "course": {"type": ["string", "null"]},
            "difficulty": {"type": ["string", "null"]},
            "notes": {"type": ["string", "null"]},
        },
        "required": ["is_recipe", "title", "ingredients", "instructions", "tags"],
    },
}


class ExtractionError(RuntimeError):
    pass


def _derive_source_site(url: str) -> str | None:
    try:
        host = urlparse(url).hostname
    except ValueError:
        return None
    if not host:
        return None
    return host[4:] if host.startswith("www.") else host


async def _call_claude(markdown: str, source_url: str) -> dict[str, Any]:
    settings = get_settings()
    client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    system = [
        {
            "type": "text",
            "text": _SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"},
        },
        {"type": "text", "text": f"Source URL: {source_url}"},
    ]

    attempts = 0
    last_exc: Exception | None = None
    while attempts < 2:
        try:
            message = await client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=system,
                tools=[SAVE_RECIPE_TOOL],
                tool_choice={"type": "tool", "name": "save_recipe"},
                messages=[{"role": "user", "content": markdown}],
            )
            usage = getattr(message, "usage", None)
            if usage is not None:
                logger.info(
                    "claude extraction usage: input=%s output=%s cache_read=%s cache_create=%s",
                    getattr(usage, "input_tokens", None),
                    getattr(usage, "output_tokens", None),
                    getattr(usage, "cache_read_input_tokens", None),
                    getattr(usage, "cache_creation_input_tokens", None),
                )
            for block in message.content:
                if getattr(block, "type", None) == "tool_use" and block.name == "save_recipe":
                    return dict(block.input)  # type: ignore[arg-type]
            raise ExtractionError("Claude did not return a save_recipe tool call")
        except APIError as exc:
            last_exc = exc
            status_code = getattr(exc, "status_code", None)
            if status_code == 529 and attempts == 0:
                attempts += 1
                continue
            raise ExtractionError(f"Claude API error: {exc}") from exc

    raise ExtractionError(f"Claude API error: {last_exc}")


async def extract_recipe(markdown: str, source_url: str) -> RecipeIn:
    raw = await _call_claude(markdown, source_url)

    if not raw.get("is_recipe", False):
        raise ExtractionError("URL does not appear to contain a recipe")

    raw.pop("is_recipe", None)
    raw["source_url"] = source_url
    raw["source_site"] = _derive_source_site(source_url)
    raw.setdefault("ingredients", [])
    raw.setdefault("instructions", [])
    raw.setdefault("tags", [])

    try:
        return RecipeIn.model_validate(raw)
    except ValidationError as exc:
        logger.warning("extraction produced invalid data: %s", exc)
        raise ExtractionError(f"Extraction produced invalid data: {exc.errors()}") from exc
