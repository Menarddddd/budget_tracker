from typing import Annotated

from fastapi import Depends, status
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependency import check_category, get_current_user
from app.models.categories import Category
from app.models.users import User
from app.repositories import categories as category_repo
from app.schemas.categories import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services.categories import create_category_service, update_category_service

router = APIRouter()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    form_data: CategoryCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await create_category_service(form_data, db, current_user)


@router.get("", response_model=list[CategoryResponse], status_code=status.HTTP_200_OK)
async def get_categories(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await category_repo.get_all_categories(current_user.id, db)


@router.get(
    "/custom", response_model=list[CategoryResponse], status_code=status.HTTP_200_OK
)
async def get_custom_categories(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await category_repo.get_custom_categories(current_user.id, db)


@router.get(
    "/{category_id}", response_model=CategoryResponse, status_code=status.HTTP_200_OK
)
async def get_category(category: Annotated[Category, Depends(check_category)]):
    return category


@router.patch(
    "/{category_id}", response_model=CategoryResponse, status_code=status.HTTP_200_OK
)
async def update_category(
    form_data: CategoryUpdate,
    category: Annotated[Category, Depends(check_category)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await update_category_service(form_data, category, db)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category: Annotated[Category, Depends(check_category)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await category_repo.delete(category, db)
