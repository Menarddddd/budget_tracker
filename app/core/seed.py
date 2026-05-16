# app/core/seed.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.categories import Category

DEFAULT_CATEGORIES = [
    {"name": "Food", "color": "#FF5733"},
    {"name": "Transport", "color": "#33FF57"},
    {"name": "Bills", "color": "#FF33A1"},
    {"name": "Entertainment", "color": "#FFD700"},
    {"name": "Shopping", "color": "#8B00FF"},
    {"name": "Health", "color": "#00CED1"},
    {"name": "Savings", "color": "#2E8B57"},
    {"name": "Other", "color": "#808080"},
]


async def seed_default_categories(db: AsyncSession):
    stmt = select(Category).where(Category.is_default.is_(True))
    result = await db.execute(stmt)
    existing = result.scalars().all()

    if existing:
        print(f"Default categories already exist ({len(existing)} found). Skipping.")
        return

    for cat in DEFAULT_CATEGORIES:
        category = Category(
            name=cat["name"],
            color=cat["color"],
            is_default=True,
            user_id=None,
        )
        db.add(category)

    await db.commit()
    print(f"Seeded {len(DEFAULT_CATEGORIES)} default categories.")
