from datetime import datetime
from typing import TYPE_CHECKING
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import UUID as PG_UUID

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.users import User


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("users.id"), nullable=False
    )
    token: Mapped[str] = mapped_column(sa.String(200), nullable=False, unique=True)
    token_type: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    new_email: Mapped[str | None] = mapped_column(sa.String(100), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
    )

    user: Mapped["User"] = relationship(back_populates="verification_tokens")
