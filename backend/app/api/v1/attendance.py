from typing import List, Optional
from datetime import datetime, timezone, date
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, require_roles
from app.models.attendance import Attendance
from app.models.member import Member
from app.models.user import User
from app.schemas.attendance import (
    CheckInRequest,
    CheckOutRequest,
    AttendanceResponse,
    AttendanceStats,
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("", response_model=List[AttendanceResponse])
def get_all_attendance(
    date_filter: Optional[str] = Query(None, alias="date", description="Filter by date (YYYY-MM-DD)"),
    member_id: Optional[str] = Query(None, description="Filter by member ID"),
    branch_id: Optional[int] = Query(None, description="Filter by branch ID"),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff", "reception"])),
):
    """Retrieve all attendance records with optional filtering."""
    query = db.query(Attendance)
    if date_filter:
        query = query.filter(Attendance.date == date_filter)
    if member_id:
        query = query.filter(
            or_(
                Attendance.member_id == member_id,
                Attendance.member_id == f"mem-{member_id}",
            )
        )
    if branch_id:
        query = query.filter(Attendance.branch_id == branch_id)
    return query.order_by(Attendance.created_at.desc()).all()


@router.get("/today", response_model=List[AttendanceResponse])
def get_today_attendance(
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff", "reception"])),
):
    """List all attendance check-ins recorded for today."""
    today_str = date.today().strftime("%Y-%m-%d")
    query = db.query(Attendance).filter(Attendance.date == today_str)
    if branch_id:
        query = query.filter(Attendance.branch_id == branch_id)
    return query.order_by(Attendance.created_at.desc()).all()


@router.get("/stats", response_model=AttendanceStats)
def get_attendance_stats(
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff", "reception"])),
):
    """Get high-level attendance metrics for dashboard."""
    today_str = date.today().strftime("%Y-%m-%d")
    query = db.query(Attendance)
    if branch_id:
        query = query.filter(Attendance.branch_id == branch_id)
    today_logs = query.filter(Attendance.date == today_str).all()
    
    checked_in_today = len(today_logs)
    active_now = len([log for log in today_logs if not log.check_out_time])
    total_monthly = query.count()

    return AttendanceStats(
        checked_in_today=checked_in_today,
        total_monthly_check_ins=total_monthly,
        active_now=active_now,
    )


@router.post("/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def check_in_member(
    check_in_data: CheckInRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff", "reception"])),
):
    """Record member check-in timestamp with flexible lookup (ID, member_code, barcode, phone, or name)."""
    search_val = (check_in_data.member_id or "").strip()
    if not search_val:
        raise HTTPException(status_code=400, detail="Member ID, code, phone, or name is required")

    member = (
        db.query(Member)
        .filter(
            or_(
                Member.id == search_val,
                Member.id == f"mem-{search_val}",
                Member.member_code == search_val,
                Member.barcode == search_val,
                Member.phone == search_val,
                Member.full_name.ilike(search_val),
            )
        )
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=404,
            detail=f"Member '{search_val}' not found. Please verify member code, barcode, or phone number.",
        )

    # Check if member already checked in today and currently inside the facility
    today_str = date.today().strftime("%Y-%m-%d")
    existing_active = (
        db.query(Attendance)
        .filter(
            Attendance.member_id == member.id,
            Attendance.date == today_str,
            Attendance.check_out_time.is_(None),
        )
        .first()
    )
    if existing_active:
        raise HTTPException(
            status_code=400,
            detail=f"{member.full_name} is already checked in and inside facility (since {existing_active.check_in_time}).",
        )

    now = datetime.now()
    new_entry = Attendance(
        branch_id=member.branch_id or 1,
        member_id=member.id,
        member_name=member.full_name,
        photo_url=member.photo_url or member.photo,
        check_in_time=now.strftime("%H:%M"),
        trainer_name=check_in_data.trainer_name,
        date=today_str,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@router.post("/check-out", response_model=AttendanceResponse)
def check_out_member(
    check_out_data: CheckOutRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff", "reception"])),
):
    """Record member check-out timestamp by attendance ID or member ID."""
    entry = None
    if check_out_data.attendance_id:
        entry = db.query(Attendance).filter(Attendance.id == check_out_data.attendance_id).first()
    elif check_out_data.member_id:
        mem_val = check_out_data.member_id.strip()
        today_str = date.today().strftime("%Y-%m-%d")
        entry = (
            db.query(Attendance)
            .filter(
                or_(
                    Attendance.member_id == mem_val,
                    Attendance.member_id == f"mem-{mem_val}",
                ),
                Attendance.date == today_str,
                Attendance.check_out_time.is_(None),
            )
            .first()
        )

    if not entry:
        raise HTTPException(status_code=404, detail="Active attendance record not found for check-out")

    now = datetime.now()
    entry.check_out_time = now.strftime("%H:%M")
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/member/{member_id}", response_model=List[AttendanceResponse])
def get_member_attendance_history(
    member_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff", "reception"])),
):
    """Retrieve full attendance history for a single member."""
    clean_id = member_id.strip()
    return (
        db.query(Attendance)
        .filter(
            or_(
                Attendance.member_id == clean_id,
                Attendance.member_id == f"mem-{clean_id}",
            )
        )
        .order_by(Attendance.created_at.desc())
        .all()
    )
