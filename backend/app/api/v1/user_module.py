from datetime import datetime, date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.branch import Branch
from app.models.member import Member
from app.schemas.user_module import (
    BranchResponse,
    BranchDetail,
    UserMemberSearchRequest,
    MemberSearchResponse,
    PublicMemberInfo,
    PublicSubscriptionInfo,
)

router = APIRouter(tags=["User Module"])


@router.get("/branch/{branch_id}", response_model=BranchResponse)
def get_branch_information(branch_id: int, db: Session = Depends(get_db)):
    """Public API: Get branch details by ID."""
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Branch not found"}
        )

    return BranchResponse(
        message="Branch found successfully",
        branch=BranchDetail(
            id=branch.id,
            name=branch.name,
            location=branch.location,
            phone=branch.phone,
            price_per_month=branch.price_per_month,
            offers=branch.offers,
        ),
    )


@router.post("/search")
def search_member_subscription(
    payload: Optional[UserMemberSearchRequest] = None,
    db: Session = Depends(get_db),
):
    """Public API: Search for a member inside a branch using member_code OR phone number."""
    if payload is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Request body is required"}
        )

    # 1. Validate branch_id
    if payload.branch_id is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "ادخل اسم الفرع !"}
        )

    # 2. Validate member_code and phone combinations
    has_code = bool(payload.member_code and payload.member_code.strip())
    has_phone = bool(payload.phone and payload.phone.strip())

    if not has_code and not has_phone:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "ادخل رقم العضوية او رقم الهاتف"}
        )

    if has_code and has_phone:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Send member_code or phone, not both"}
        )

    # 3. Query member in the specific branch
    query = db.query(Member).filter(Member.branch_id == payload.branch_id)
    if has_code:
        code_val = payload.member_code.strip()
        query = query.filter((Member.member_code == code_val) | (Member.id == code_val) | (Member.id == f"mem-{code_val}"))
    else:
        phone_val = payload.phone.strip()
        query = query.filter(Member.phone == phone_val)

    member = query.first()
    if not member:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Member not found"}
        )

    # 4. Determine subscription info
    member_code = member.member_code if member.member_code else str(member.id).replace("mem-", "")
    member_name = member.full_name

    subscription_data: Optional[PublicSubscriptionInfo] = None

    if member.status == "active":
        # Calculate start, end, duration and remaining days
        try:
            start_date_obj = datetime.strptime(member.join_date, "%Y-%m-%d").date()
        except Exception:
            start_date_obj = date.today()

        # Default standard 30-day duration if not otherwise calculated
        duration = 30
        end_date_obj = start_date_obj + timedelta(days=duration)
        today = date.today()

        remaining_days = max(0, (end_date_obj - today).days)

        sub_id = member.subscription_id
        if isinstance(sub_id, str) and sub_id.startswith("sub-"):
            clean_sub_id = sub_id.replace("sub-", "")
            sub_id_val = int(clean_sub_id) if clean_sub_id.isdigit() else 1
        else:
            sub_id_val = 1

        subscription_data = PublicSubscriptionInfo(
            id=sub_id_val,
            start_date=start_date_obj.strftime("%Y-%m-%d"),
            end_date=end_date_obj.strftime("%Y-%m-%d"),
            duration=duration,
            status="active",
            remaining_days=remaining_days,
        )

    # Clean member_id for display
    clean_mem_id = member.id.replace("mem-", "") if isinstance(member.id, str) else member.id
    mem_id_val = int(clean_mem_id) if str(clean_mem_id).isdigit() else member.id

    return {
        "message": "Member found successfully",
        "member": {
            "id": mem_id_val,
            "member_code": member_code,
            "name": member_name,
        },
        "subscription": subscription_data.model_dump() if subscription_data else None,
    }
