from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, require_roles
from app.models.member import Member
from app.models.user import User
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse

router = APIRouter(prefix="/members", tags=["Members"])


@router.get("", response_model=List[MemberResponse])
def get_members(
    search: Optional[str] = Query(None, description="Search by name, email or phone"),
    status: Optional[str] = Query(None, description="Filter by status (active, expiring, expired)"),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Retrieve members list with search and status filtering."""
    query = db.query(Member)
    if status:
        query = query.filter(Member.status == status)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Member.full_name.ilike(search_pattern),
                Member.email.ilike(search_pattern),
                Member.phone.ilike(search_pattern),
            )
        )
    return query.order_by(Member.created_at.desc()).all()


@router.get("/{member_id}", response_model=MemberResponse)
def get_member(
    member_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Get single member by ID."""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member


@router.post("", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    member_in: MemberCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Create a new member record."""
    existing = db.query(Member).filter(Member.email == member_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="A member with this email already exists")

    new_member = Member(
        full_name=member_in.full_name,
        email=member_in.email,
        phone=member_in.phone,
        gender=member_in.gender,
        date_of_birth=member_in.date_of_birth,
        join_date=member_in.join_date,
        subscription_id=member_in.subscription_id,
        plan_name=member_in.plan_name,
        status=member_in.status,
        trainer_id=member_in.trainer_id,
        photo_url=member_in.photo_url,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member


@router.put("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: str,
    member_in: MemberUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Update member profile & subscription details."""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    update_data = member_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    member_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin"])),
):
    """Delete a member record (Admin only)."""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return None
