from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException

from app.models.expenses import Expense
from app.models.users import User
from app.schemas.expenses import ExpenseCreate, ExpenseUpdate
from app.repositories import budget_cycles as cycle_repo
from app.repositories import expenses as expense_repo
from app.services.budget_cycles import get_active_budget_cycle_service


async def create_expense_service(
    form_data: ExpenseCreate,
    db: AsyncSession,
    current_user: User,
) -> Expense:
    cycle = await cycle_repo.get_cycle_by_date(
        current_user.id,
        form_data.expense_date,
        db,
    )

    if not cycle:
        # This may auto-renew current cycle if needed
        await get_active_budget_cycle_service(db, current_user)

        # Try again after renewal
        cycle = await cycle_repo.get_cycle_by_date(
            current_user.id,
            form_data.expense_date,
            db,
        )

    if not cycle:
        raise BadRequestException("No budget cycle found for the provided expense date")

    new_expense = Expense(
        user_id=current_user.id,
        cycle_id=cycle.id,
        category_id=form_data.category_id,
        amount=form_data.amount,
        description=form_data.description,
        expense_date=form_data.expense_date,
    )

    return await expense_repo.save(new_expense, db)


async def update_expense_service(
    form_data: ExpenseUpdate, expense: Expense, db: AsyncSession
) -> Expense:
    expense_data = form_data.model_dump(exclude_unset=True)

    if not expense_data:
        raise BadRequestException("No fields to update")

    for key, val in expense_data.items():
        setattr(expense, key, val)

    return await expense_repo.update(expense, db)
