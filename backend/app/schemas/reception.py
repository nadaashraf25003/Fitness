from typing import Optional, Union, Dict, Any
from pydantic import BaseModel, ConfigDict


class ReceptionLoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None


class ReceptionSearchRequest(BaseModel):
    branch_id: Optional[int] = None
    member_code: Optional[str] = None
    phone: Optional[str] = None


class ReceptionAttendanceRequest(BaseModel):
    branch_id: Optional[int] = None
    member_code: Optional[str] = None
    barcode: Optional[str] = None


class MemberDetails(BaseModel):
    id: Union[int, str]
    member_code: str
    name: str
    phone: str
    photo: Optional[str] = None
    note: Optional[str] = None
    branch_id: Optional[int] = None


class SubscriptionDetails(BaseModel):
    id: Union[int, str]
    start_date: str
    end_date: str
    duration: int
    status: str
    remaining_days: int


class AttendanceRecord(BaseModel):
    id: Union[int, str]
    check_in: str


class CreateRequestPayload(BaseModel):
    request_type: Optional[str] = None
    branch_id: Optional[int] = None
    member_id: Optional[Union[int, str]] = None
    member: Optional[Dict[str, Any]] = None
    subscription: Optional[Dict[str, Any]] = None
