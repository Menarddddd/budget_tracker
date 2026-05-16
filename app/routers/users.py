from typing import Annotated

from fastapi import Depends, status
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependency import get_current_user
from app.models.users import User
from app.schemas.users import (
    EmailChangeRequest,
    UserDelete,
    UserPasswordChange,
    UserResponse,
    UserUpdate,
)
from app.services.users import (
    change_password_service,
    delete_account_service,
    update_profile_service,
)

router = APIRouter()


@router.get("", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def profile(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user


@router.patch("", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def update_profile(
    form_data: UserUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await update_profile_service(form_data, db, current_user)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    form_data: UserPasswordChange,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await change_password_service(form_data, db, current_user)


@router.post("/change-email", status_code=status.HTTP_200_OK)
async def change_email(
    form_data: EmailChangeRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    pass


@router.post("/delete-account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    form_data: UserDelete,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await delete_account_service(form_data, db, current_user)
