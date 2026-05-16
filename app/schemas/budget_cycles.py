from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class BudgetCycleBase(BaseModel):
    budget_amount: Decimal = Field(
        gt=0, max_digits=10, decimal_places=2, examples=[2000.00]
    )
    start_date: date = Field(examples=["2025-05-01"])


class BudgetCycleCreate(BudgetCycleBase):
    pass


class BudgetCycleResponse(BudgetCycleBase):
    id: UUID
    user_id: UUID
    end_date: date
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BudgetCycleUpdate(BaseModel):
    budget_amount: Decimal | None = Field(
        default=None, gt=0, max_digits=10, decimal_places=2, examples=[2500.00]
    )
