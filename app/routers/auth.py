from typing import Annotated

from fastapi import Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.routing import APIRouter

from app.core.database import get_db
from app.schemas.users import Token, UserCreate
from app.services.auth import create_user_service, login_service

router = APIRouter()


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await login_service(form_data.username, form_data.password, db)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(
    form_data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await create_user_service(form_data, db)


@router.get("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(token: str, db: Annotated[AsyncSession, Depends(get_db)]):
    pass
