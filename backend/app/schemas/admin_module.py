from typing import Optional, Union
from pydantic import BaseModel


class PendingRequestListItem(BaseModel):
    request_id: Union[int, str]
    branch_id: Optional[int] = 1
    member_name: str
    member_code: Union[int, str]
    request_type: str
    duration: int
    paid_amount: float
    payment_method: str
    email: Optional[str] = None
    phone: Optional[str] = None
    plan_id: Optional[str] = None
    plan_name: Optional[str] = None
    requested_start_date: Optional[str] = None
    status: Optional[str] = "pending"
    notes: Optional[str] = None
    created_at: Optional[str] = None


class AdminMemberData(BaseModel):
    name: str
    member_id: Union[int, str]
    email: Optional[str] = None
    phone: Optional[str] = None


class AdminSubscriptionData(BaseModel):
    start_date: str
    end_date: str
    duration: int
    price: float
    paid_amount: float
    payment_method: str
    plan_id: Optional[str] = None
    plan_name: Optional[str] = None
    notes: Optional[str] = None


class RequestDetailsResponse(BaseModel):
    request_id: Union[int, str]
    branch_id: int
    request_type: str
    status: str
    member_data: AdminMemberData
    subscription_data: AdminSubscriptionData

