from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.refresh_tokens import RefreshToken


async def save(token: RefreshToken, db: AsyncSession) -> RefreshToken:
    db.add(token)
    await db.commit()
    await db.refresh(token)
    return token


async def get_by_hashed_token(
    hashed_token: str, db: AsyncSession
) -> RefreshToken | None:
    stmt = select(RefreshToken).where(RefreshToken.hashed_token == hashed_token)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def revoke(token: RefreshToken, db: AsyncSession) -> None:
    """Revoke a single token"""
    token.is_revoked = True
    await db.commit()


async def revoke_all_for_user(user_id: UUID, db: AsyncSession) -> None:
    stmt = select(RefreshToken).where(
        RefreshToken.user_id == user_id, RefreshToken.is_revoked.is_(False)
    )
    result = await db.execute(stmt)
    tokens = result.scalars().all()

    for token in tokens:
        token.is_revoked = True

    await db.commit()
