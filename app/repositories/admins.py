from uuid import UUID
from sqlalchemy import select, or_, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.utils import decode_cursor
from app.models.users import User
from app.models.categories import Category

# =====================
# User Operations
# =====================


async def get_user_by_id(user_id: UUID, db: AsyncSession) -> User | None:
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_users(
    db: AsyncSession,
    limit: int = 20,
    cursor: str | None = None,
):
    stmt = select(User).order_by(desc(User.created_at), desc(User.id)).limit(limit + 1)

    if cursor:
        cursor_created_at, cursor_id = decode_cursor(cursor)
        stmt = stmt.where(
            or_(
                User.created_at < cursor_created_at,
                and_(
                    User.created_at == cursor_created_at,
                    User.id < cursor_id,
                ),
            )
        )

    result = await db.execute(stmt)
    return result.scalars().all()


async def update_user(user: User, db: AsyncSession) -> User:
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(user: User, db: AsyncSession) -> None:
    """Hard delete a user and all their data."""
    await db.delete(user)
    await db.commit()


async def get_default_categories(db: AsyncSession):
    stmt = select(Category).where(Category.is_default.is_(True))
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_default_category_by_id(
    category_id: UUID, db: AsyncSession
) -> Category | None:
    stmt = select(Category).where(
        Category.id == category_id, Category.is_default.is_(True)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def save_category(category: Category, db: AsyncSession) -> Category:
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def update_category(category: Category, db: AsyncSession) -> Category:
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(category: Category, db: AsyncSession) -> None:
    await db.delete(category)
    await db.commit()
