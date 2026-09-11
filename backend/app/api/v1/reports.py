from datetime import datetime, date, timedelta, timezone
from calendar import monthrange
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.api.deps import get_db, require_roles
from app.models.user import User
from app.models.subscription_request import SubscriptionRequest
from app.models.payment import Payment
from app.models.attendance import Attendance
from app.models.member import Member
from app.schemas.report import (
    PeriodInfo,
    SubscriptionsReportData,
    SubscriptionsReportResponse,
    IncomeReportData,
    IncomeReportResponse,
    TopMemberItem,
    ExpiredSubscriptionItem,
)

router = APIRouter(tags=["Reports"])


def parse_and_validate_period(
    period_type: str,
    start_date_str: Optional[str],
    end_date_str: Optional[str],
    allow_year: bool = False,
) -> tuple[str, str]:
    """Parse and validate report period according to API documentation spec."""
    allowed_types = ["today", "week", "month", "custom"]
    if allow_year:
        allowed_types.append("year")

    period_type = (period_type or "today").lower().strip()
    if period_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid period")

    today = date.today()

    if period_type == "today":
        today_str = today.strftime("%Y-%m-%d")
        return today_str, today_str

    elif period_type == "week":
        # Week starts on Monday and ends on Sunday
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")

    elif period_type == "month":
        start = date(today.year, today.month, 1)
        _, last_day = monthrange(today.year, today.month)
        end = date(today.year, today.month, last_day)
        return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")

    elif period_type == "year":
        start = date(today.year, 1, 1)
        end = date(today.year, 12, 31)
        return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")

    elif period_type == "custom":
        if not start_date_str or not end_date_str:
            raise HTTPException(status_code=400, detail="start_date and end_date are required")

        try:
            start = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format (YYYY-MM-DD)")

        if start > end:
            raise HTTPException(status_code=400, detail="start_date must be before end_date")

        return start_date_str, end_date_str

    raise HTTPException(status_code=400, detail="Invalid period")


@router.get("/report/subscriptions/{branch_id}", response_model=SubscriptionsReportResponse)
def get_subscriptions_report(
    branch_id: int,
    type: str = Query("today", description="Period type: today, week, month, custom"),
    start_date: Optional[str] = Query(None, description="Format: YYYY-MM-DD (Required for custom)"),
    end_date: Optional[str] = Query(None, description="Format: YYYY-MM-DD (Required for custom)"),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Returns the count of approved subscription requests (new, renew, extend, cancel) for the branch within period."""
    start_str, end_str = parse_and_validate_period(type, start_date, end_date, allow_year=False)

    # Filter approved requests in the branch and date range
    requests = (
        db.query(SubscriptionRequest)
        .filter(
            SubscriptionRequest.branch_id == branch_id,
            SubscriptionRequest.status == "approved",
            SubscriptionRequest.requested_start_date >= start_str,
            SubscriptionRequest.requested_start_date <= end_str,
        )
        .all()
    )

    counts = {"new": 0, "renew": 0, "extend": 0, "cancel": 0}
    for req in requests:
        req_type = (req.request_type or "new").lower()
        if req_type in counts:
            counts[req_type] += 1
        else:
            counts["new"] += 1

    return SubscriptionsReportResponse(
        period=PeriodInfo(start_date=start_str, end_date=end_str),
        subscriptions=SubscriptionsReportData(**counts),
    )


@router.get("/report/income/{branch_id}", response_model=IncomeReportResponse)
def get_income_report(
    branch_id: int,
    type: str = Query("today", description="Period type: today, week, month, year, custom"),
    start_date: Optional[str] = Query(None, description="Format: YYYY-MM-DD (Required for custom)"),
    end_date: Optional[str] = Query(None, description="Format: YYYY-MM-DD (Required for custom)"),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Returns total income for the branch during selected period separated by method (cash, visa, transfer, total)."""
    start_str, end_str = parse_and_validate_period(type, start_date, end_date, allow_year=True)

    payments = (
        db.query(Payment)
        .filter(
            Payment.branch_id == branch_id,
            Payment.status == "paid",
            Payment.date >= start_str,
            Payment.date <= end_str,
        )
        .all()
    )

    cash = 0.0
    visa = 0.0
    transfer = 0.0

    for pay in payments:
        method = (pay.method or "cash").lower()
        if method == "cash":
            cash += pay.amount
        elif method in ["visa", "card", "online"]:
            visa += pay.amount
        elif method == "transfer":
            transfer += pay.amount
        else:
            cash += pay.amount

    total = round(cash + visa + transfer, 2)

    return IncomeReportResponse(
        period=PeriodInfo(start_date=start_str, end_date=end_str),
        income=IncomeReportData(
            cash=round(cash, 2),
            visa=round(visa, 2),
            transfer=round(transfer, 2),
            total=total,
        ),
    )


@router.get("/report/top-members/{branch_id}", response_model=List[TopMemberItem])
def get_top_members_report(
    branch_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Returns the top 10 members with highest number of attendance records ordered descending."""
    results = (
        db.query(
            Attendance.member_id,
            Attendance.member_name,
            func.count(Attendance.id).label("attendance_count"),
        )
        .filter(Attendance.branch_id == branch_id)
        .group_by(Attendance.member_id, Attendance.member_name)
        .order_by(desc("attendance_count"))
        .limit(10)
        .all()
    )

    top_members = []
    for row in results:
        member = db.query(Member).filter(Member.id == row.member_id).first()
        code = member.member_code if (member and member.member_code) else str(row.member_id).replace("mem-", "")
        top_members.append(
            TopMemberItem(
                member_id=row.member_id,
                member_code=code,
                name=row.member_name,
                attendance_count=row.attendance_count,
            )
        )

    return top_members


@router.get("/report/expired-subscriptions/{branch_id}", response_model=List[ExpiredSubscriptionItem])
def get_expired_subscriptions_report(
    branch_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Returns members whose subscription is expired and who do not have an active or scheduled subscription."""
    today_str = date.today().strftime("%Y-%m-%d")

    # Find members in this branch marked expired or with join_date + duration expired and not active
    expired_members = (
        db.query(Member)
        .filter(
            Member.branch_id == branch_id,
            Member.status == "expired",
        )
        .all()
    )

    items = []
    for m in expired_members:
        code = m.member_code if m.member_code else str(m.id).replace("mem-", "")
        items.append(
            ExpiredSubscriptionItem(
                member_id=m.id,
                member_code=code,
                name=m.full_name,
                phone=m.phone,
                end_date=m.join_date or today_str,
            )
        )

    return items
