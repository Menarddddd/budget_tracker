from uuid import UUID
from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    model_validator,
    field_validator,
    ConfigDict,
)


class Token(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    refresh_token: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UserBase(BaseModel):
    first_name: str = Field(min_length=2, max_length=100)
    last_name: str = Field(min_length=2, max_length=100)
    username: str = Field(min_length=7, max_length=100)
    email: EmailStr = Field(min_length=7, max_length=100)


class UserCreate(UserBase):
    password: str = Field(min_length=7, max_length=200)

    model_config = ConfigDict(extra="forbid")


class UserResponse(UserBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=2, max_length=100)
    last_name: str | None = Field(default=None, min_length=2, max_length=100)
    username: str | None = Field(default=None, min_length=7, max_length=100)

    model_config = ConfigDict(extra="forbid")


class UserPasswordChange(BaseModel):
    old_password: str = Field(min_length=7, max_length=200)
    new_password: str = Field(min_length=7, max_length=200)

    # UNCOMMENT AFTER DEVELOPMENT
    # @field_validator("new_password")
    # @classmethod
    # def validate_password(cls, value):
    #     if not any(char.isdigit() for char in value):
    #         raise ValueError("Password must contain at least one number")
    #     if not any(char.isupper() for char in value):
    #         raise ValueError("Password must contain at least one uppercase letter")
    #     return value

    @model_validator(mode="after")
    def validate_passwords_different(self):
        if self.old_password == self.new_password:
            raise ValueError("New password cannot be the same as old password")
        return self

    model_config = ConfigDict(extra="forbid")


class UserDelete(BaseModel):
    password: str = Field(min_length=7, max_length=200)
    reason: str | None = Field(default=None, max_length=200)


class EmailChangeRequest(BaseModel):
    new_email: EmailStr = Field(min_length=7, max_length=100)
    password: str = Field(min_length=7, max_length=200)
