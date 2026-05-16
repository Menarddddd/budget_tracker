from typing import TYPE_CHECKING
from decimal import Decimal
import uuid
import sqlalchemy as sa
from datetime import date, datetime
from sqlalchemy import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.budget_cycles import BudgetCycle
    from app.models.categories import Category


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("users.id"), nullable=False
    )
    cycle_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("budget_cycles.id"), nullable=False
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("categories.id"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(sa.DECIMAL(10, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    expense_date: Mapped[date] = mapped_column(sa.Date(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now()
    )

    user: Mapped["User"] = relationship(back_populates="expenses")
    budget_cycle: Mapped["BudgetCycle"] = relationship(back_populates="expenses")
    category: Mapped["Category"] = relationship(back_populates="expenses")
