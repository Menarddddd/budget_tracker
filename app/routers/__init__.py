from fastapi import FastAPI

from app.routers.auth import router as auth_router
from app.routers.users import router as user_router
from app.routers.budget_cycles import router as cycle_router
from app.routers.categories import router as category_router


def register_routers(app: FastAPI):
    app.include_router(auth_router, prefix="/auth", tags=["auth"])
    app.include_router(user_router, prefix="/users", tags=["users"])
    app.include_router(cycle_router, prefix="/budget-cycles", tags=["budget-cycles"])
    app.include_router(category_router, prefix="/categories", tags=["categories"])
