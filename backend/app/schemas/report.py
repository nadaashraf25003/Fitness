from typing import Union, Optional
from pydantic import BaseModel, ConfigDict


class PeriodInfo(BaseModel):
    start_date: str
    end_date: str


class SubscriptionsReportData(BaseModel):
    new: int = 0
    renew: int = 0
    extend: int = 0
    cancel: int = 0


class SubscriptionsReportResponse(BaseModel):
    period: PeriodInfo
    subscriptions: SubscriptionsReportData


class IncomeReportData(BaseModel):
    cash: float = 0.0
    visa: float = 0.0
    transfer: float = 0.0
    total: float = 0.0


class IncomeReportResponse(BaseModel):
    period: PeriodInfo
    income: IncomeReportData


class TopMemberItem(BaseModel):
    member_id: Union[int, str]
    member_code: str
    name: str
    attendance_count: int


class ExpiredSubscriptionItem(BaseModel):
    member_id: Union[int, str]
    member_code: str
    name: str
    phone: str
    end_date: str
