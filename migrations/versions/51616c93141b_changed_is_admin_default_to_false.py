"""changed is_admin default to false

Revision ID: 51616c93141b
Revises: 2e50ec8bbe54
Create Date: 2026-05-18 07:31:42.862858

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "51616c93141b"
down_revision: Union[str, Sequence[str], None] = "2e50ec8bbe54"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "is_admin",
        existing_type=sa.Boolean(),
        server_default=sa.text("false"),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "is_admin",
        existing_type=sa.Boolean(),
        server_default=sa.text("true"),
        existing_nullable=False,
    )
