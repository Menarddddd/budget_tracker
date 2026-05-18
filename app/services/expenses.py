from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, FieldNotFoundException
from app.core.utils import encode_cursor
from app.models.expenses import Expense
from app.models.users import User
from app.schemas.expenses import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
    PaginatedExpenseResponse,
)
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
        await get_active_budget_cycle_service(db, current_user)

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


async def get_expenses_service(
    cycle_id: UUID,
    db: AsyncSession,
    current_user: User,
    limit: int = 20,
    cursor: str | None = None,
) -> PaginatedExpenseResponse:
    # verify cycle belongs to user
    cycle = await cycle_repo.get_budget_cycle_by_id(cycle_id, db)
    if not cycle or cycle.user_id != current_user.id:
        raise FieldNotFoundException("cycle", str(cycle_id))

    # Get expenses (limit + 1)
    expenses = await expense_repo.get_cycle_expenses(
        cycle_id, current_user.id, db, limit, cursor
    )

    # Check if more items exist
    has_next = len(expenses) > limit

    # Trim to actual limit
    if has_next:
        expenses = expenses[:limit]

    # Build next cursor from last item
    next_cursor = None
    if has_next and expenses:
        last = expenses[-1]
        next_cursor = encode_cursor(last.created_at, last.id)

    return PaginatedExpenseResponse(
        items=[ExpenseResponse.model_validate(e) for e in expenses],
        next_cursor=next_cursor,
        has_next=has_next,
    )


async def update_expense_service(
    form_data: ExpenseUpdate, expense: Expense, db: AsyncSession
) -> Expense:
    expense_data = form_data.model_dump(exclude_unset=True)

    if not expense_data:
        raise BadRequestException("No fields to update")

    for key, val in expense_data.items():
        setattr(expense, key, val)

    return await expense_repo.update(expense, db)
