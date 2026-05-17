from decimal import Decimal
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class ExpenseBase(BaseModel):
    category_id: UUID
    amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2, examples=[500.00])
    description: str | None = Field(default=None, max_length=255)
    expense_date: date = Field(examples=["2025-03-21"])


class ExpenseCreate(ExpenseBase):
    model_config = ConfigDict(extra="forbid")


class ExpenseResponse(ExpenseBase):
    id: UUID
    user_id: UUID
    cycle_id: UUID
    updated_at: datetime
    created_at: datetime


class ExpenseUpdate(BaseModel):
    category_id: UUID | None = None
    amount: Decimal | None = Field(
        default=None, gt=0, max_digits=10, decimal_places=2, examples=[500.00]
    )
    description: str | None = Field(default=None, max_length=255)
    expense_date: date | None = Field(default=None, examples=["2025-03-21"])

    model_config = ConfigDict(extra="forbid")
