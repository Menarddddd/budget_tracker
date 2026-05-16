from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BadRequestException,
    DuplicateEntryException,
)
from app.models.categories import Category
from app.models.users import User
from app.schemas.categories import CategoryCreate, CategoryUpdate
from app.repositories import categories as category_repo


async def create_category_service(
    form_data: CategoryCreate, db: AsyncSession, current_user: User
) -> Category:
    new_category = Category(
        user_id=current_user.id,
        name=form_data.name,
        color=form_data.color,
    )

    try:
        category = await category_repo.save(new_category, db)

    except IntegrityError as e:
        await db.rollback()
        error = str(e.orig)

        if "uq_user_category_name" in error:
            raise DuplicateEntryException("name", form_data.name)
        else:
            raise BadRequestException("Category couldn't be created")

    return category


async def update_category_service(
    form_data: CategoryUpdate, category: Category, db: AsyncSession
) -> Category:
    category_data = form_data.model_dump(exclude_unset=True)

    if not category_data:
        raise BadRequestException("No fields to update")

    for key, val in category_data.items():
        setattr(category, key, val)

    try:
        return await category_repo.update(category, db)
    except IntegrityError as e:
        await db.rollback()
        error = str(e.orig)

        if "uq_user_category_name" in error:
            raise DuplicateEntryException("name", category_data.get("name", ""))
        else:
            raise BadRequestException("Category could not be updated")
