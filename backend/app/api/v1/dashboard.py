from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.user import User
from app.models.member import Member
from app.models.subscription_request import SubscriptionRequest
from app.models.attendance import Attendance
from app.models.payment import Payment
from app.schemas.dashboard import DashboardResponse

router = APIRouter(tags=["Dashboard Module"])


@router.get("/dashboard/{branch_id}", response_model=DashboardResponse)
def get_branch_dashboard(
    branch_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff", "reception"])),
):
    """Admin Dashboard: Get flat summary statistics for a specific branch.

    Returns:
        {
            "members": <int>,
            "active_subscriptions": <int>,
            "pending_requests": <int>,
            "today_subscriptions": <int>,
            "today_attendance": <int>,
            "today_income": <float>
        }
    """
    today_str = date.today().strftime("%Y-%m-%d")

    # 1. Total Members in this branch
    total_members = db.query(Member).filter(Member.branch_id == branch_id).count()

    # 2. Active Subscriptions (members with status=active)
    active_subscriptions = (
        db.query(Member)
        .filter(Member.branch_id == branch_id, Member.status == "active")
        .count()
    )

    # 3. Pending Requests
    pending_requests = (
        db.query(SubscriptionRequest)
        .filter(
            SubscriptionRequest.branch_id == branch_id,
            SubscriptionRequest.status == "pending",
        )
        .count()
    )

    # 4. Today's Subscriptions — total approved requests starting today
    today_subscriptions = (
        db.query(SubscriptionRequest)
        .filter(
            SubscriptionRequest.branch_id == branch_id,
            SubscriptionRequest.status == "approved",
            SubscriptionRequest.requested_start_date == today_str,
        )
        .count()
    )

    # 5. Today's Attendance count
    today_attendance = (
        db.query(Attendance)
        .filter(Attendance.branch_id == branch_id, Attendance.date == today_str)
        .count()
    )

    # 6. Today's Total Income (sum of all paid payments today)
    today_payments = (
        db.query(Payment)
        .filter(
            Payment.branch_id == branch_id,
            Payment.date == today_str,
            Payment.status == "paid",
        )
        .all()
    )
    today_income = round(sum(float(p.amount or 0) for p in today_payments), 2)

    return DashboardResponse(
        members=total_members,
        active_subscriptions=active_subscriptions,
        pending_requests=pending_requests,
        today_subscriptions=today_subscriptions,
        today_attendance=today_attendance,
        today_income=today_income,
    )
