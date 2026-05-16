from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BadRequestException,
    CredentialsException,
    DuplicateEntryException,
)
from app.core.security import create_access_token, hash_password, verify_password
from app.core.utils import clean_user_info
from app.models.users import User
from app.repositories import users as user_repo
from app.schemas.users import UserCreate


async def login_service(username: str, password: str, db: AsyncSession):
    username = username.strip().lower()
    user = await user_repo.get_user_by_username(username, db)
    if not user or not verify_password(password, user.hashed_password):
        raise CredentialsException("Invalid credentials")

    if user.deleted_at:
        raise BadRequestException("Account is deleted, recover it first")

    # TODO: uncomment when email verification is implemented
    # if not user.is_verified:
    #     raise ForbiddenException("Please verify your email first")

    access_token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "Bearer",
    }


async def create_user_service(form_data: UserCreate, db: AsyncSession):
    user_data = clean_user_info(form_data.model_dump())

    new_user = User(
        first_name=user_data["first_name"],
        last_name=user_data["last_name"],
        username=user_data["username"],
        email=user_data["email"],
        hashed_password=hash_password(form_data.password),
    )

    try:
        await user_repo.save(new_user, db)
        return {
            "message": "You've successfully created your account, you can now login with it"
        }

    except IntegrityError as e:
        await db.rollback()
        error = str(e.orig)

        if "uq_users_username" in error:
            raise DuplicateEntryException("username", user_data["username"])
        elif "uq_users_email" in error:
            raise DuplicateEntryException("email", user_data["email"])
        else:
            raise BadRequestException("Account could not be created")
