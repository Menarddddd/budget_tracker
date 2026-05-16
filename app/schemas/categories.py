from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color: str = Field(min_length=7, max_length=7)


class CategoryCreate(CategoryBase):
    model_config = ConfigDict(extra="forbid")


class CategoryResponse(CategoryBase):
    id: UUID
    user_id: UUID | None
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    color: str | None = Field(
        default=None, min_length=7, max_length=7, examples=["#FFF000"]
    )

    model_config = ConfigDict(extra="forbid")
