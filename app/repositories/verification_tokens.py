from sqlalchemy import select
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
