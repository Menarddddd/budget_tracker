from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AdminUserResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    username: str
    email: str
    is_verified: bool
    is_admin: bool
    deleted_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminUserUpdate(BaseModel):
    is_verified: bool | None = None
    is_admin: bool | None = None
