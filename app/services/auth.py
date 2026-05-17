from datetime import datetime, timedelta, timezone
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.email_templates import verification_email_template
from app.core.exceptions import (
    BadRequestException,
    CredentialsException,
    DuplicateEntryException,
)
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    generate_verification_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.core.settings import settings
from app.core.utils import clean_user_info, send_email
from app.models.refresh_tokens import RefreshToken
from app.models.tokens import EmailVerificationToken
from app.models.users import User
from app.repositories import users as user_repo
from app.repositories import refresh_tokens as token_repo
from app.repositories import verification_tokens as verify_repo
from app.schemas.users import Token, UserCreate


async def login_service(
    username: str, password: str, db: AsyncSession, user_agent: str | None = None
) -> Token:
    user = await user_repo.get_user_by_username(username, db)

    if not user or not verify_password(password, user.hashed_password):
        raise CredentialsException("Invalid credentials")

    if user.deleted_at:
        raise BadRequestException("Account is deleted, recover it first")

    # if not user.is_verified:
    #     raise ForbiddenException("Please verify your email first")

    return await _generate_tokens(user, db, user_agent)


async def refresh_token_service(
    raw_refresh_token: str, db: AsyncSession, user_agent: str | None = None
) -> Token:
    # Step 1: Hash the incoming token
    hashed = hash_refresh_token(raw_refresh_token)

    # Step 2: Find it in DB
    token_record = await token_repo.get_by_hashed_token(hashed, db)

    # Step 3: Validate
    if not token_record:
        raise CredentialsException("Invalid refresh token")

    if token_record.is_revoked:
        raise CredentialsException("Refresh token has been revoked")

    if token_record.expires_at < datetime.now(timezone.utc):
        raise CredentialsException("Refresh token has expired")

    # Step 4: Get the user
    user = await user_repo.get_user_by_id(token_record.user_id, db)

    if not user:
        raise CredentialsException("User not found")

    if user.deleted_at:
        raise BadRequestException("Account has been deleted")

    # Step 5: Revoke old token (rotation)
    await token_repo.revoke(token_record, db)

    # Step 6: Generate new tokens
    return await _generate_tokens(user, db, user_agent)


async def logout_service(raw_refresh_token: str, db: AsyncSession) -> None:
    hashed = hash_refresh_token(raw_refresh_token)
    token_record = await token_repo.get_by_hashed_token(hashed, db)

    if token_record and not token_record.is_revoked:
        await token_repo.revoke(token_record, db)


async def _generate_tokens(
    user: User, db: AsyncSession, user_agent: str | None = None
) -> Token:
    """
    Private helper.
    Generates access + refresh token, saves refresh token to DB.
    Called by both login and refresh.
    """
    # Generate access token (JWT)
    access_token = create_access_token({"sub": str(user.id)})

    # Generate refresh token (random string)
    raw_refresh_token = generate_refresh_token()
    hashed = hash_refresh_token(raw_refresh_token)

    # Save hashed refresh token to DB
    refresh_token_record = RefreshToken(
        user_id=user.id,
        hashed_token=hashed,
        user_agent=user_agent,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.REFRESH_DAYS_EXPIRE),
    )
    await token_repo.save(refresh_token_record, db)

    return Token(
        access_token=access_token,
        refresh_token=raw_refresh_token,
        token_type="Bearer",
    )


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

    except IntegrityError as e:
        await db.rollback()
        error = str(e.orig)

        if "uq_users_username" in error:
            raise DuplicateEntryException("username", user_data["username"])
        elif "uq_users_email" in error:
            raise DuplicateEntryException("email", user_data["email"])
        else:
            raise BadRequestException("Account could not be created")

    raw_token = generate_verification_token()

    verification_token = EmailVerificationToken(
        user_id=new_user.id,
        token=raw_token,
        token_type="email_verification",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    )

    await verify_repo.save(verification_token, db)

    body = verification_email_template(
        username=new_user.username,
        token=raw_token,
    )

    send_email(
        to_email=new_user.email, subject="Verify your Budget Tracker email", body=body
    )

    return {
        "message": "You've successfully created your account, you can now login with it"
    }


async def verify_email_service(token: str, db: AsyncSession) -> dict:
    # Step 1: Find token in DB
    token_record = await verify_repo.get_by_token(token, db)

    # Step 2: Check if token exists
    if not token_record:
        raise BadRequestException("Invalid or expired verification token")

    # Step 3: Check token type
    if token_record.token_type != "email_verification":
        raise BadRequestException("Invalid token type")

    # Step 4: Check if expired
    if token_record.expires_at < datetime.now(timezone.utc):
        # Delete expired token
        await verify_repo.delete(token_record, db)
        raise BadRequestException(
            "Verification token has expired. Please request a new one."
        )

    # Step 5: Get the user
    user = await user_repo.get_user_by_id(token_record.user_id, db)

    if not user:
        raise BadRequestException("User not found")

    # Step 6: Check if already verified
    if user.is_verified:
        # Delete the token since it's no longer needed
        await verify_repo.delete(token_record, db)
        raise BadRequestException("Email is already verified. You can login.")

    # Step 7: Mark user as verified
    user.is_verified = True
    await user_repo.update(user, db)

    # Step 8: Delete used token (one-time use)
    await verify_repo.delete(token_record, db)

    return {"message": "Email verified successfully. You can now login."}
