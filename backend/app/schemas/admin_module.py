from typing import Optional, Union
from pydantic import BaseModel


class PendingRequestListItem(BaseModel):
    request_id: Union[int, str]
    member_name: str
    member_code: Union[int, str]
    request_type: str
    duration: int
    paid_amount: float
    payment_method: str


class AdminMemberData(BaseModel):
    name: str
    member_id: Union[int, str]


class AdminSubscriptionData(BaseModel):
    start_date: str
    end_date: str
    duration: int
    price: float
    paid_amount: float
    payment_method: str


class RequestDetailsResponse(BaseModel):
    request_id: Union[int, str]
    branch_id: int
    request_type: str
    status: str
    member_data: AdminMemberData
    subscription_data: AdminSubscriptionData
