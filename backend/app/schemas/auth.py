from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, ConfigDict
from pydantic.alias_generators import to_camel


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class LoginCredentials(BaseSchema):
    email: EmailStr
    pass_: Optional[str] = None  # matches 'pass' in frontend LoginCredentials
    password: Optional[str] = None

    @property
    def plain_password(self) -> str:
        return self.pass_ or self.password or ""


class UserResponse(BaseSchema):
    id: str
    name: str
    email: str
    role: Literal["admin", "staff", "member"]
    avatar_url: Optional[str] = None


class TokenResponse(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
