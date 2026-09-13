from typing import Optional, Union
from pydantic import BaseModel, ConfigDict


class BranchDetail(BaseModel):
    id: int
    name: str
    location: str
    phone: str
    price_per_month: float
    offers: Optional[str] = None


class BranchResponse(BaseModel):
    message: str = "Branch found successfully"
    branch: BranchDetail


class UserMemberSearchRequest(BaseModel):
    branch_id: Optional[int] = None
    member_code: Optional[str] = None
    phone: Optional[str] = None


class PublicMemberInfo(BaseModel):
    id: Union[int, str]
    member_code: str
    name: str


class PublicSubscriptionInfo(BaseModel):
    id: Union[int, str]
    start_date: str
    end_date: str
    duration: int
    status: str
    remaining_days: int


class MemberSearchResponse(BaseModel):
    message: str = "Member found successfully"
    member: PublicMemberInfo
    subscription: Optional[PublicSubscriptionInfo] = None
