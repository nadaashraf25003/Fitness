from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

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


@router.get("/today", response_model=List[AttendanceResponse])
def get_today_attendance(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """List all attendance check-ins recorded for today."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return db.query(Attendance).filter(Attendance.date == today_str).order_by(Attendance.created_at.desc()).all()


@router.get("/stats", response_model=AttendanceStats)
def get_attendance_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Get high-level attendance metrics for dashboard."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_logs = db.query(Attendance).filter(Attendance.date == today_str).all()
    
    checked_in_today = len(today_logs)
    active_now = len([log for log in today_logs if not log.check_out_time])
    total_monthly = db.query(Attendance).count()

    return AttendanceStats(
        checked_in_today=checked_in_today,
        total_monthly_check_ins=total_monthly,
        active_now=active_now,
    )


@router.post("/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def check_in_member(
    check_in_data: CheckInRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Record member check-in timestamp."""
    member = db.query(Member).filter(Member.id == check_in_data.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    now = datetime.now(timezone.utc)
    new_entry = Attendance(
        member_id=member.id,
        member_name=member.full_name,
        photo_url=member.photo_url,
        check_in_time=now.strftime("%H:%M"),
        trainer_name=check_in_data.trainer_name,
        date=now.strftime("%Y-%m-%d"),
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@router.post("/check-out", response_model=AttendanceResponse)
def check_out_member(
    check_out_data: CheckOutRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Record member check-out timestamp."""
    entry = db.query(Attendance).filter(Attendance.id == check_out_data.attendance_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    now = datetime.now(timezone.utc)
    entry.check_out_time = now.strftime("%H:%M")
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/member/{member_id}", response_model=List[AttendanceResponse])
def get_member_attendance_history(
    member_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Retrieve full attendance history for a single member."""
    return db.query(Attendance).filter(Attendance.member_id == member_id).order_by(Attendance.created_at.desc()).all()
