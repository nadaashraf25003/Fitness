from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, ConfigDict
from pydantic.alias_generators import to_camel

SubscriptionStatus = Literal["active", "expiring", "expired"]
Gender = Literal["male", "female", "other"]


class MemberBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    gender: Gender = "other"
    date_of_birth: str
    join_date: str
    subscription_id: str
    plan_name: str
    status: SubscriptionStatus = "active"
    trainer_id: Optional[str] = None
    photo_url: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    gender: Optional[Gender] = None
    date_of_birth: Optional[str] = None
    join_date: Optional[str] = None
    subscription_id: Optional[str] = None
    plan_name: Optional[str] = None
    status: Optional[SubscriptionStatus] = None
    trainer_id: Optional[str] = None
    photo_url: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class MemberResponse(MemberBase):
    id: str
