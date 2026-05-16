from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.exceptions import AppException
from app.core.seed import seed_default_categories
from app.routers import register_routers
from app import models
from app.core.database import AsyncSessionLocal, Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        # TODO: Replace with Alembic migrations before deploying to production
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        try:
            await seed_default_categories(db)
        except Exception as e:
            print(f"Seeding failed: {e}")
            await db.rollback()
            raise

    yield

    await engine.dispose()


app = FastAPI(lifespan=lifespan)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


register_routers(app)
