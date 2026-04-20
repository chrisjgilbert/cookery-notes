import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class Ingredient(BaseModel):
    quantity: str | None = None
    unit: str | None = None
    name: str
    notes: str | None = None


class InstructionStep(BaseModel):
    step: int
    text: str


class RecipeBase(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    source_url: str | None = None
    source_site: str | None = None
    description: str | None = None
    image_url: str | None = None
    prep_time_minutes: int | None = None
    cook_time_minutes: int | None = None
    total_time_minutes: int | None = None
    servings: int | None = None
    ingredients: list[Ingredient] = Field(default_factory=list)
    instructions: list[InstructionStep] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    cuisine: str | None = None
    course: str | None = None
    difficulty: str | None = None
    notes: str | None = None


class RecipeIn(RecipeBase):
    pass


class RecipeOut(RecipeBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class RecipeSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    image_url: str | None = None
    total_time_minutes: int | None = None
    servings: int | None = None
    tags: list[str] = Field(default_factory=list)
    cuisine: str | None = None
    course: str | None = None
    created_at: datetime


class RecipeListResponse(BaseModel):
    items: list[RecipeSummary]
    total: int
    limit: int
    offset: int


class RecipePatch(BaseModel):
    title: str | None = None
    source_url: str | None = None
    source_site: str | None = None
    description: str | None = None
    image_url: str | None = None
    prep_time_minutes: int | None = None
    cook_time_minutes: int | None = None
    total_time_minutes: int | None = None
    servings: int | None = None
    ingredients: list[Ingredient] | None = None
    instructions: list[InstructionStep] | None = None
    tags: list[str] | None = None
    cuisine: str | None = None
    course: str | None = None
    difficulty: str | None = None
    notes: str | None = None


class ImportRequest(BaseModel):
    url: HttpUrl
