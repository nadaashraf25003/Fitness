from pydantic import BaseModel


class TodaySubscriptions(BaseModel):
    new: int = 0
    renew: int = 0
    extend: int = 0
    cancel: int = 0


class TodayIncome(BaseModel):
    cash: float = 0.0
    visa: float = 0.0
    transfer: float = 0.0
    total: float = 0.0


class DashboardResponse(BaseModel):
    members: int
    active_subscriptions: int
    pending_requests: int
    today_subscriptions: TodaySubscriptions
    today_attendance: int
    today_income: TodayIncome
