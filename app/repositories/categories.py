from uuid import UUID
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.categories import Category


async def save(category: Category, db: AsyncSession) -> Category:
    """Save a new category to the database"""
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def update(category: Category, db: AsyncSession) -> Category:
    """Update an existing category in the database"""
    await db.commit()
    await db.refresh(category)
    return category


async def delete(category: Category, db: AsyncSession) -> None:
    """Hard delete a category from database"""
    await db.delete(category)
    await db.commit()


async def get_category_by_id(category_id: UUID, db: AsyncSession) -> Category | None:
    stmt = select(Category).where(Category.id == category_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_categories(user_id: UUID, db: AsyncSession):
    stmt = select(Category).where(
        or_(
            Category.user_id == user_id,
            Category.user_id.is_(None),
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_custom_categories(user_id: UUID, db: AsyncSession):
    stmt = select(Category).where(Category.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_default_categories(db: AsyncSession):
    stmt = select(Category).where(Category.is_default.is_(True))
    result = await db.execute(stmt)
    return result.scalars().all()
