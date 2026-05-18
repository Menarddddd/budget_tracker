from typing import Annotated
from uuid import UUID

from fastapi import Depends, Query, status
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependency import require_admin
from app.models.users import User
from app.schemas.admins import AdminUserResponse, AdminUserUpdate
from app.schemas.categories import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services.admins import (
    get_all_users_service,
    get_user_detail_service,
    update_user_service,
    delete_user_service,
    create_default_category_service,
    update_default_category_service,
    delete_default_category_service,
)
from app.repositories import admins as admin_repo

router = APIRouter(dependencies=[Depends(require_admin)])


# =====================
# User Management
# =====================


@router.get("/users", status_code=status.HTTP_200_OK)
async def get_all_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(default=20, ge=1, le=100),
    cursor: str | None = None,
):
    return await get_all_users_service(db, limit, cursor)


@router.get(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    status_code=status.HTTP_200_OK,
)
async def get_user_detail(
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await get_user_detail_service(user_id, db)


@router.patch(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    status_code=status.HTTP_200_OK,
)
async def update_user(
    user_id: UUID,
    form_data: AdminUserUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(require_admin)],
):
    return await update_user_service(user_id, form_data, db, admin)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(require_admin)],
):
    await delete_user_service(user_id, db, admin)


# =====================
# Default Categories
# =====================


@router.get(
    "/categories",
    response_model=list[CategoryResponse],
    status_code=status.HTTP_200_OK,
)
async def get_default_categories(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await admin_repo.get_default_categories(db)


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_default_category(
    form_data: CategoryCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await create_default_category_service(form_data, db)


@router.patch(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    status_code=status.HTTP_200_OK,
)
async def update_default_category(
    category_id: UUID,
    form_data: CategoryUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await update_default_category_service(category_id, form_data, db)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_default_category(
    category_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await delete_default_category_service(category_id, db)
