from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.database import AsyncSessionLocal, engine
from app.core.exceptions import AppException
from app.core.seed import seed_default_categories
from app.routers import register_routers
from app import models


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncSessionLocal() as db:
        try:
            await seed_default_categories(db)
        except Exception as e:
            print(f"Seeding failed: {e}")
            await db.rollback()
            raise

    yield

    await engine.dispose()


app = FastAPI(title="Budget Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


register_routers(app)

# comment
