import uuid
from typing import TYPE_CHECKING
import sqlalchemy as sa
from datetime import datetime
from sqlalchemy import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.refresh_tokens import RefreshToken
    from app.models.tokens import EmailVerificationToken
    from app.models.budget_cycles import BudgetCycle
    from app.models.categories import Category
    from app.models.expenses import Expense


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    first_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    username: Mapped[str] = mapped_column(sa.String(100), nullable=False, index=True)
    email: Mapped[str] = mapped_column(sa.String(100), nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(sa.String(200), nullable=False)
    is_admin: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, default=False, server_default=sa.text("false")
    )
    deletion_reason: Mapped[str | None] = mapped_column(sa.String(200), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    is_verified: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now()
    )

    refresh_tokens: Mapped["RefreshToken"] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    verification_tokens: Mapped[list["EmailVerificationToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    budget_cycles: Mapped[list["BudgetCycle"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    categories: Mapped[list["Category"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    expenses: Mapped[list["Expense"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (
        sa.UniqueConstraint("username", name="uq_users_username"),
        sa.UniqueConstraint("email", name="uq_users_email"),
        sa.CheckConstraint("LENGTH(username) >= 7", name="ck_username_length"),
        sa.CheckConstraint("LENGTH(email) >= 7", name="ck_email_length"),
    )
