from decimal import Decimal
from typing import TYPE_CHECKING
import uuid
import sqlalchemy as sa
from datetime import date, datetime
from sqlalchemy import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.expenses import Expense


class BudgetCycle(Base):
    __tablename__ = "budget_cycles"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("users.id"),
        nullable=False,
    )
    budget_amount: Mapped[Decimal] = mapped_column(sa.DECIMAL(10, 2), nullable=False)
    start_date: Mapped[date] = mapped_column(sa.Date(), nullable=False)
    end_date: Mapped[date] = mapped_column(sa.Date(), nullable=False)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), index=True
    )

    user: Mapped["User"] = relationship(back_populates="budget_cycles")
    expenses: Mapped[list["Expense"]] = relationship(back_populates="budget_cycle")

    __table_args__ = (
        sa.CheckConstraint("budget_amount >= 0", name="check_budget_positive"),
    )
