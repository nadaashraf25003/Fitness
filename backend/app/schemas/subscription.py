from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from pydantic.alias_generators import to_camel

RequestStatus = Literal["pending", "approved", "rejected"]


class SubscriptionRequestCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    plan_id: str
    plan_name: str
    requested_start_date: str
    notes: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class SubscriptionRequestStatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class SubscriptionRequestResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    phone: str
    plan_id: str
    plan_name: str
    requested_start_date: str
    status: RequestStatus
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
