from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from pydantic.alias_generators import to_camel


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class LoginCredentials(BaseModel):
    email: EmailStr
    password: Optional[str] = Field(None, alias="pass")
    password_alt: Optional[str] = Field(None, alias="password")

    model_config = ConfigDict(
        populate_by_name=True,
        extra="allow",
    )

    @property
    def plain_password(self) -> str:
        return self.password or self.password_alt or ""


class UserResponse(BaseSchema):
    id: str
    name: str
    email: str
    role: Literal["admin", "staff", "member", "reception"]
    avatar_url: Optional[str] = None


class TokenResponse(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

