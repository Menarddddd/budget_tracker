from datetime import date
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict, field_validator


class CategorySummary(BaseModel):
    category_id: UUID
    category_name: str
    color: str
    total_spent: Decimal
    percentage_of_budget: float
    percentage_of_spent: float


class BudgetCycleSummary(BaseModel):
    cycle_id: UUID
    budget_amount: Decimal
    total_spent: Decimal
    remaining: Decimal
    is_overspent: bool
    overspent_amount: Decimal
    percentage_spent: float
    by_category: list[CategorySummary]


class BudgetCycleBase(BaseModel):
    budget_amount: Decimal = Field(
        gt=0, max_digits=10, decimal_places=2, examples=[2000.00]
    )
    start_date: date = Field(examples=["2025-05-01"])

    @field_validator("start_date")
    @classmethod
    def validate_start_date(cls, value):
        today = date.today()

        if value.year != today.year or value.month != today.month:
            raise ValueError(
                f"Start date must be within the current month and same year "
                f"({today.strftime('%B %Y')})"
            )
        return value


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
