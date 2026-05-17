from typing import Annotated
from uuid import UUID

from fastapi import Depends, status
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependency import check_expense, get_current_user
from app.models.expenses import Expense
from app.models.users import User
from app.schemas.expenses import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services.expenses import create_expense_service, update_expense_service
from app.repositories import expenses as expense_repo

router = APIRouter()


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    form_data: ExpenseCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await create_expense_service(form_data, db, current_user)


@router.get("", response_model=list[ExpenseResponse], status_code=status.HTTP_200_OK)
async def get_expenses(
    cycle_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await expense_repo.get_cycle_expenses(cycle_id, current_user.id, db)


@router.get(
    "/{expense_id}", response_model=ExpenseResponse, status_code=status.HTTP_200_OK
)
async def get_expense(expense: Annotated[Expense, Depends(check_expense)]):
    return expense


@router.patch(
    "/{expense_id}", response_model=ExpenseResponse, status_code=status.HTTP_200_OK
)
async def update_expense(
    form_data: ExpenseUpdate,
    expense: Annotated[Expense, Depends(check_expense)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await update_expense_service(form_data, expense, db)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense: Annotated[Expense, Depends(check_expense)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await expense_repo.delete(expense, db)
