from typing import Annotated

from fastapi import Depends, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.routing import APIRouter

from app.core.database import get_db
from app.schemas.users import (
    ForgotPasswordRequest,
    RefreshRequest,
    ResendEmailVerificationRequest,
    ResetPasswordRequest,
    Token,
    UserCreate,
)
from app.services.auth import (
    create_user_service,
    forgot_password_service,
    login_service,
    logout_service,
    refresh_token_service,
    resend_email_verification_service,
    verify_email_service,
    verify_reset_password_service,
)

router = APIRouter()


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await login_service(
        form_data.username, form_data.password, db, request.headers.get("user-agent")
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    form_data: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await logout_service(form_data.refresh_token, db)


@router.post("/refresh", response_model=Token, status_code=status.HTTP_200_OK)
async def refresh(
    form_data: RefreshRequest, db: Annotated[AsyncSession, Depends(get_db)]
):
    return await refresh_token_service(form_data.refresh_token, db)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(
    form_data: UserCreate,
    background_task: BackgroundTasks,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await create_user_service(form_data, db, background_task)


@router.get("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(
    token: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await verify_email_service(token, db)


@router.post("/resend-verification-email", status_code=status.HTTP_200_OK)
async def resend_verification_email(
    form_data: ResendEmailVerificationRequest,
    background_task: BackgroundTasks,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await resend_email_verification_service(form_data.email, db, background_task)


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    form_data: ForgotPasswordRequest,
    background_task: BackgroundTasks,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await forgot_password_service(form_data.email, db, background_task)


@router.post("/verify-reset-password", status_code=status.HTTP_200_OK)
async def verify_reset_password(
    form_data: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await verify_reset_password_service(form_data, db)
