from datetime import datetime, timedelta, timezone
import jwt
from pwdlib import PasswordHash

from app.core.settings import settings

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
