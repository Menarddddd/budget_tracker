from uuid import UUID

from sqlalchemy import select
from sqlalchemy import delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tokens import EmailVerificationToken


async def save(
    token: EmailVerificationToken, db: AsyncSession
) -> EmailVerificationToken:
    db.add(token)
    await db.commit()
    await db.refresh(token)
    return token


async def delete(token: EmailVerificationToken, db: AsyncSession) -> None:
    await db.delete(token)
    await db.commit()


async def get_by_token(token: str, db: AsyncSession) -> EmailVerificationToken | None:
    stmt = select(EmailVerificationToken).where(EmailVerificationToken.token == token)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def delete_by_user_id(user_id: UUID, token_type: str, db: AsyncSession) -> None:
    stmt = sa_delete(EmailVerificationToken).where(
        EmailVerificationToken.user_id == user_id,
        EmailVerificationToken.token_type == token_type,
    )
    await db.execute(stmt)
    await db.commit()
