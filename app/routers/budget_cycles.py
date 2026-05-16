from typing import Annotated, Sequence

from fastapi import Depends, status
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependency import check_cycle, get_current_user
from app.models.budget_cycles import BudgetCycle
from app.models.users import User
from app.repositories import budget_cycles as cycle_repo
from app.schemas.budget_cycles import (
    BudgetCycleCreate,
    BudgetCycleResponse,
    BudgetCycleUpdate,
)
from app.services.budget_cycles import (
    create_budget_cycle_service,
    get_active_budget_cycle_service,
    update_budget_cycle_service,
)

router = APIRouter()


@router.post(
    "", response_model=BudgetCycleResponse, status_code=status.HTTP_201_CREATED
)
async def create_budget_cycle(
    form_data: BudgetCycleCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> BudgetCycle:
    return await create_budget_cycle_service(form_data, db, current_user)


@router.get(
    "/active", response_model=BudgetCycleResponse, status_code=status.HTTP_200_OK
)
async def get_active_budget_cycle(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> BudgetCycle:
    return await get_active_budget_cycle_service(db, current_user)


@router.get(
    "/all", response_model=list[BudgetCycleResponse], status_code=status.HTTP_200_OK
)
async def get_budget_cycles(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Sequence[BudgetCycle]:
    return await cycle_repo.get_budget_cycles(current_user.id, db)


@router.get(
    "/{cycle_id}", response_model=BudgetCycleResponse, status_code=status.HTTP_200_OK
)
async def get_budget_cycle(
    budget_cycle: Annotated[BudgetCycle, Depends(check_cycle)],
) -> BudgetCycle:
    return budget_cycle


@router.patch(
    "/{cycle_id}", response_model=BudgetCycleResponse, status_code=status.HTTP_200_OK
)
async def update_budget_cycle(
    form_data: BudgetCycleUpdate,
    budget_cycle: Annotated[BudgetCycle, Depends(check_cycle)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BudgetCycle:
    return await update_budget_cycle_service(form_data, budget_cycle, db)
