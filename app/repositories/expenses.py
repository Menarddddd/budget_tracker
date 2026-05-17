from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.categories import Category
from app.models.expenses import Expense


async def save(expense: Expense, db: AsyncSession) -> Expense:
    """Save a new expense to the database"""
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense


async def update(expense: Expense, db: AsyncSession) -> Expense:
    """Update an existing expense in the database"""
    await db.commit()
    await db.refresh(expense)
    return expense


async def delete(expense: Expense, db: AsyncSession) -> None:
    """Hard delete an expense from database"""
    await db.delete(expense)
    await db.commit()


async def get_expense_by_id(expense_id: UUID, db: AsyncSession) -> Expense | None:
    stmt = select(Expense).where(Expense.id == expense_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_cycle_expenses(cycle_id: UUID, user_id: UUID, db: AsyncSession):
    stmt = select(Expense).where(
        Expense.cycle_id == cycle_id, Expense.user_id == user_id
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_expense_summary_by_cycle(cycle_id: UUID, db: AsyncSession):
    """Returns total spent per category for a given cycle"""
    stmt = (
        select(
            Expense.category_id,
            Category.name.label("category_name"),
            Category.color,
            func.sum(Expense.amount).label("total_spent"),
        )
        .join(Category, Expense.category_id == Category.id)
        .where(Expense.cycle_id == cycle_id)
        .group_by(Expense.category_id, Category.name, Category.color)
    )

    result = await db.execute(stmt)
    return result.all()
