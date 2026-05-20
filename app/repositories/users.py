from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import User


async def save(user: User, db: AsyncSession) -> User:
    """Save a new user to the database"""
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update(user: User, db: AsyncSession) -> User:
    """Commit changes to an existing user"""
    await db.commit()
    await db.refresh(user)
    return user


async def delete(user: User, db: AsyncSession) -> None:
    """Hard delete a user from database"""
    await db.delete(user)
    await db.commit()


async def _get_user(condition, db: AsyncSession, *options):
    stmt = select(User).where(condition)
    if options:
        stmt = stmt.options(*options)

    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_id(user_id: UUID, db: AsyncSession, *options):
    return await _get_user(User.id == user_id, db, *options)


async def get_user_by_username(username: str, db: AsyncSession, *options):
    return await _get_user(User.username == username, db, *options)


async def get_user_by_email(email: str, db: AsyncSession, *options):
    return await _get_user(User.email == email, db, *options)
