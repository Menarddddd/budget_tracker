from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, FieldNotFoundException
from app.core.utils import calculate_end_date, get_cycle_start_for_today
from app.models.budget_cycles import BudgetCycle
from app.models.users import User
from app.repositories import budget_cycles as cycle_repo
from app.schemas.budget_cycles import BudgetCycleCreate, BudgetCycleUpdate


async def create_budget_cycle_service(
    form_data: BudgetCycleCreate, db: AsyncSession, current_user: User
) -> BudgetCycle:

    has_cycle = await cycle_repo.user_has_any_cycle(current_user.id, db)

    if has_cycle:
        raise BadRequestException(
            "You already have a budget cycle set up. "
            "The system will auto-renew it every month. "
            "Visit your dashboard to see your current cycle."
        )

    # First time setup only
    end_date = calculate_end_date(form_data.start_date)

    new_budget_cycle = BudgetCycle(
        user_id=current_user.id,
        budget_amount=form_data.budget_amount,
        start_date=form_data.start_date,
        end_date=end_date,
    )

    try:
        return await cycle_repo.save(new_budget_cycle, db)
    except Exception as e:
        await db.rollback()
        print(f"CYCLE CREATION ERROR: {type(e).__name__}: {e}")
        raise BadRequestException("Budget cycle couldn't be created")


async def get_active_budget_cycle_service(
    db: AsyncSession, current_user: User
) -> BudgetCycle:
    """
    Returns the current active budget cycle.
    This is also where AUTO-RENEWAL happens.
    """
    active = await cycle_repo.get_active_budget_cycle(current_user.id, db)

    # No cycle exists at all (user never set one up)
    if not active:
        raise FieldNotFoundException("budget cycle", str(current_user.id))

    # Cycle exists but has expired
    if active.end_date < date.today():

        # Deactivate the old cycle
        # It stays in DB as historical record
        active.is_active = False
        await cycle_repo.update(active, db)

        # Calculate new cycle dates
        # We preserve the ORIGINAL start day
        new_start = get_cycle_start_for_today(active.start_date.day, date.today())
        new_end = calculate_end_date(new_start)

        # Create new cycle
        # We carry over the same budget_amount from the old cycle
        # User can always update it via PATCH /budget-cycles/{id}
        new_cycle = BudgetCycle(
            user_id=current_user.id,
            budget_amount=active.budget_amount,  # ← carried over
            start_date=new_start,
            end_date=new_end,
            is_active=True,
        )

        #  Save and return new cycle
        return await cycle_repo.save(new_cycle, db)

    # Cycle exists and is still running, just return it
    return active


async def update_budget_cycle_service(
    form_data: BudgetCycleUpdate, budget_cycle: BudgetCycle, db: AsyncSession
) -> BudgetCycle:
    """
    Updates the budget_amount of an existing cycle.
    """
    if form_data.budget_amount is None:
        raise BadRequestException("No fields to update")

    budget_cycle.budget_amount = form_data.budget_amount
    return await cycle_repo.update(budget_cycle, db)
