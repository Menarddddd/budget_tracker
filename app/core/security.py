from datetime import datetime, timedelta, timezone
import hashlib
from uuid import UUID
import jwt
import hmac
import secrets
from pwdlib import PasswordHash
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import settings
from app.models.tokens import EmailVerificationToken
from app.repositories import verification_tokens as verify_repo

password_hash = PasswordHash.recommended()


def hash_password(password):
    return password_hash.hash(password)


def verify_password(plain_pwd, hashed_pwd):
    return password_hash.verify(plain_pwd, hashed_pwd)


def create_access_token(sub: dict):
    to_encode = sub.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_MINUTES_EXPIRE
    )
    payload = jwt.encode(
        to_encode,
        settings.ACCESS_SECRET_KEY.get_secret_value(),
        algorithm=settings.ALGORITHM,
    )

    return payload


def generate_verification_token() -> str:
    """
    Generates a random token for email verification and password reset
    """
    return secrets.token_urlsafe(32)


def generate_refresh_token() -> str:
    """Generates a random refresh token"""
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    """Deterministic hashing"""
    return hmac.new(
        key=settings.REFRESH_SECRET_KEY.get_secret_value().encode(),
        msg=token.encode(),
        digestmod=hashlib.sha256,
    ).hexdigest()


async def create_and_save_token(user_id: UUID, token_type: str, db: AsyncSession):
    raw_token = generate_verification_token()

    verification_token = EmailVerificationToken(
        user_id=user_id,
        token=raw_token,
        token_type=token_type,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    )

    await verify_repo.save(verification_token, db)
    return raw_token
