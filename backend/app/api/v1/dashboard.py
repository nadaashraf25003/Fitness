from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.user import User
from app.models.branch import Branch
from app.models.member import Member
from app.models.subscription_request import SubscriptionRequest
from app.models.attendance import Attendance
from app.models.payment import Payment
from app.schemas.dashboard import (
    DashboardResponse,
    TodaySubscriptions,
    TodayIncome,
)

router = APIRouter(tags=["Dashboard Module"])


@router.get("/dashboard/{branch_id}", response_model=DashboardResponse)
def get_branch_dashboard(
    branch_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Admin Dashboard: Get main summary statistics for a specific branch."""
    today_str = date.today().strftime("%Y-%m-%d")

    # 1. Total Members in this branch
    total_members = db.query(Member).filter(Member.branch_id == branch_id).count()

    # 2. Active Subscriptions in this branch
    active_subscriptions = (
        db.query(Member)
        .filter(Member.branch_id == branch_id, Member.status == "active")
        .count()
    )

    # 3. Pending Requests in this branch
    pending_requests = (
        db.query(SubscriptionRequest)
        .filter(SubscriptionRequest.branch_id == branch_id, SubscriptionRequest.status == "pending")
        .count()
    )

    # 4. Today's Subscriptions (approved requests today broken down by type)
    today_reqs = (
        db.query(SubscriptionRequest)
        .filter(
            SubscriptionRequest.branch_id == branch_id,
            SubscriptionRequest.status == "approved",
            SubscriptionRequest.requested_start_date == today_str,
        )
        .all()
    )

    sub_counts = {"new": 0, "renew": 0, "extend": 0, "cancel": 0}
    for req in today_reqs:
        req_type = (req.request_type or "new").lower()
        if req_type in sub_counts:
            sub_counts[req_type] += 1
        else:
            sub_counts["new"] += 1

    # 5. Today's Attendance count
    today_attendance = (
        db.query(Attendance)
        .filter(Attendance.branch_id == branch_id, Attendance.date == today_str)
        .count()
    )

    # 6. Today's Income breakdown
    today_payments = (
        db.query(Payment)
        .filter(Payment.branch_id == branch_id, Payment.date == today_str, Payment.status == "paid")
        .all()
    )

    cash = 0.0
    visa = 0.0
    transfer = 0.0

    for pay in today_payments:
        method = (pay.method or "cash").lower()
        if method == "cash":
            cash += pay.amount
        elif method in ["visa", "card", "online"]:
            visa += pay.amount
        elif method == "transfer":
            transfer += pay.amount
        else:
            cash += pay.amount

    total_income = round(cash + visa + transfer, 2)

    return DashboardResponse(
        members=total_members,
        active_subscriptions=active_subscriptions,
        pending_requests=pending_requests,
        today_subscriptions=TodaySubscriptions(**sub_counts),
        today_attendance=today_attendance,
        today_income=TodayIncome(
            cash=round(cash, 2),
            visa=round(visa, 2),
            transfer=round(transfer, 2),
            total=total_income,
        ),
    )
