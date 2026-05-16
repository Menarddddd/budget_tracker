from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BadRequestException,
    CredentialsException,
    DuplicateEntryException,
)
from app.core.security import hash_password, verify_password
from app.core.utils import clean_user_info
from app.models.users import User
from app.schemas.users import UserDelete, UserPasswordChange, UserUpdate
from app.repositories import users as user_repo


async def update_profile_service(
    form_data: UserUpdate, db: AsyncSession, current_user: User
):
    user_data = clean_user_info(form_data.model_dump(exclude_unset=True))

    if not user_data:
        raise BadRequestException("No fields to update")

    for key, val in user_data.items():
        setattr(current_user, key, val)

    try:
        await user_repo.update(current_user, db)

    except IntegrityError as e:
        await db.rollback()
        error = str(e.orig)
        if "uq_users_username" in error:
            raise DuplicateEntryException("username", user_data.get("username", ""))
        else:
            raise BadRequestException("Profile could not be updated")

    return current_user


async def change_password_service(
    form_data: UserPasswordChange, db: AsyncSession, current_user: User
):
    if not verify_password(form_data.old_password, current_user.hashed_password):
        raise CredentialsException("Incorrect current password")

    current_user.hashed_password = hash_password(form_data.new_password)
    await user_repo.update(current_user, db)


async def delete_account_service(
    form_data: UserDelete, db: AsyncSession, current_user: User
):
    if not verify_password(form_data.password, current_user.hashed_password):
        raise CredentialsException("Incorrect password")

    current_user.deleted_at = datetime.now(timezone.utc)
    current_user.deletion_reason = form_data.reason
    await user_repo.update(current_user, db)
