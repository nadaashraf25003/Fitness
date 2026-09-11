from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from pydantic.alias_generators import to_camel


class TrainerBase(BaseModel):
    full_name: str
    specialty: str
    bio: str
    hourly_rate: float = 0.0
    phone: str
    email: EmailStr
    photo_url: Optional[str] = None
    is_available: bool = True
    assigned_members_count: int = 0

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class TrainerCreate(TrainerBase):
    pass


class TrainerUpdate(BaseModel):
    full_name: Optional[str] = None
    specialty: Optional[str] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None
    is_available: Optional[bool] = None
    assigned_members_count: Optional[int] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class TrainerResponse(TrainerBase):
    id: str
