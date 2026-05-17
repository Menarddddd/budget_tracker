from datetime import date
from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.budget_cycles import BudgetCycle


async def save(budget_cycle: BudgetCycle, db: AsyncSession) -> BudgetCycle:
    """Save a new budget_cycle to the database"""
    db.add(budget_cycle)
    await db.commit()
    await db.refresh(budget_cycle)
    return budget_cycle


async def update(budget_cycle: BudgetCycle, db: AsyncSession) -> BudgetCycle:
    """Update an existing budget_cycle in the database"""
    await db.commit()
    await db.refresh(budget_cycle)
    return budget_cycle


async def user_has_any_cycle(user_id: UUID, db: AsyncSession) -> bool:
    stmt = select(BudgetCycle).where(BudgetCycle.user_id == user_id).limit(1)
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None


async def get_active_budget_cycle(
    user_id: UUID, db: AsyncSession
) -> BudgetCycle | None:
    stmt = select(BudgetCycle).where(
        and_(BudgetCycle.is_active.is_(True), BudgetCycle.user_id == user_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_budget_cycle_by_id(
    cycle_id: UUID, db: AsyncSession
) -> BudgetCycle | None:
    stmt = select(BudgetCycle).where(BudgetCycle.id == cycle_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_budget_cycles(user_id: UUID, db: AsyncSession):
    stmt = select(BudgetCycle).where(BudgetCycle.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_cycle_by_date(
    user_id: UUID,
    expense_date: date,
    db: AsyncSession,
) -> BudgetCycle | None:
    stmt = select(BudgetCycle).where(
        and_(
            BudgetCycle.user_id == user_id,
            BudgetCycle.start_date <= expense_date,
            BudgetCycle.end_date >= expense_date,
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
