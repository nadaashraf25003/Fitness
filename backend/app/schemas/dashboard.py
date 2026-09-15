from pydantic import BaseModel


class DashboardResponse(BaseModel):
    """Flat dashboard summary returned by GET /admin/dashboard/{branch_id}.

    Shape matches what the frontend DashboardPage expects:
    {
        "members": 0,
        "active_subscriptions": 0,
        "pending_requests": 0,
        "today_subscriptions": 0,
        "today_attendance": 0,
        "today_income": 0
    }
    """

    members: int = 0
    active_subscriptions: int = 0
    pending_requests: int = 0
    today_subscriptions: int = 0
    today_attendance: int = 0
    today_income: float = 0.0
