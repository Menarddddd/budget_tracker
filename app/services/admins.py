from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BadRequestException,
    FieldNotFoundException,
    ForbiddenException,
)
from app.core.utils import encode_cursor
from app.models.categories import Category
from app.models.users import User
from app.repositories import admins as admin_repo
from app.schemas.admins import AdminUserResponse, AdminUserUpdate
from app.schemas.categories import CategoryCreate, CategoryUpdate

# =====================
# User Management
# =====================


async def get_all_users_service(
    db: AsyncSession,
    limit: int = 20,
    cursor: str | None = None,
) -> dict:
    users = await admin_repo.get_all_users(db, limit, cursor)

    has_next = len(users) > limit

    if has_next:
        users = users[:limit]

    next_cursor = None
    if has_next and users:
        last = users[-1]
        next_cursor = encode_cursor(last.created_at, last.id)

    return {
        "items": [AdminUserResponse.model_validate(u) for u in users],
        "next_cursor": next_cursor,
        "has_next": has_next,
    }


async def get_user_detail_service(user_id: UUID, db: AsyncSession) -> User:
    user = await admin_repo.get_user_by_id(user_id, db)
    if not user:
        raise FieldNotFoundException("user", str(user_id))
    return user


async def update_user_service(
    user_id: UUID,
    form_data: AdminUserUpdate,
    db: AsyncSession,
    current_admin: User,
) -> User:
    user = await admin_repo.get_user_by_id(user_id, db)
    if not user:
        raise FieldNotFoundException("user", str(user_id))

    # Prevent admin from modifying themselves
    if user.id == current_admin.id:
        raise ForbiddenException("You cannot modify your own admin account")

    update_data = form_data.model_dump(exclude_unset=True)

    if not update_data:
        raise BadRequestException("No fields to update")

    for key, val in update_data.items():
        setattr(user, key, val)

    return await admin_repo.update_user(user, db)


async def delete_user_service(
    user_id: UUID,
    db: AsyncSession,
    current_admin: User,
) -> None:
    user = await admin_repo.get_user_by_id(user_id, db)
    if not user:
        raise FieldNotFoundException("user", str(user_id))

    # Prevent admin from deleting themselves
    if user.id == current_admin.id:
        raise ForbiddenException("You cannot delete your own account from admin panel")

    await admin_repo.delete_user(user, db)


# =====================
# Default Categories
# =====================


async def create_default_category_service(
    form_data: CategoryCreate, db: AsyncSession
) -> Category:
    new_category = Category(
        user_id=None,
        name=form_data.name,
        color=form_data.color,
        is_default=True,
    )
    return await admin_repo.save_category(new_category, db)


async def update_default_category_service(
    category_id: UUID,
    form_data: CategoryUpdate,
    db: AsyncSession,
) -> Category:
    category = await admin_repo.get_default_category_by_id(category_id, db)
    if not category:
        raise FieldNotFoundException("default category", str(category_id))

    update_data = form_data.model_dump(exclude_unset=True)

    if not update_data:
        raise BadRequestException("No fields to update")

    for key, val in update_data.items():
        setattr(category, key, val)

    return await admin_repo.update_category(category, db)


async def delete_default_category_service(category_id: UUID, db: AsyncSession) -> None:
    category = await admin_repo.get_default_category_by_id(category_id, db)
    if not category:
        raise FieldNotFoundException("default category", str(category_id))

    await admin_repo.delete_category(category, db)
