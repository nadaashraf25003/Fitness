from datetime import datetime, date, timedelta, timezone
from typing import List, Optional, Union
import random
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.user import User
from app.models.branch import Branch
from app.models.member import Member
from app.models.subscription_request import SubscriptionRequest
from app.models.payment import Payment
from app.schemas.admin_module import (
    PendingRequestListItem,
    RequestDetailsResponse,
    AdminMemberData,
    AdminSubscriptionData,
)

router = APIRouter(tags=["Admin Requests Module"])


def parse_id(id_val: Union[int, str], prefix: str = "") -> str:
    s = str(id_val)
    if prefix and not s.startswith(prefix) and s.isdigit():
        return f"{prefix}{s}"
    return s


def find_pending_request(search_id_str: str, db: Session) -> Optional[SubscriptionRequest]:
    """Find a pending subscription request by ID, prefix, or code."""
    s = str(search_id_str).strip()
    clean_id = s.replace("req-", "")
    return (
        db.query(SubscriptionRequest)
        .filter(
            (SubscriptionRequest.id == s)
            | (SubscriptionRequest.id == f"req-{s}")
            | (SubscriptionRequest.id == f"req-{clean_id}")
            | (SubscriptionRequest.id == clean_id)
            | (SubscriptionRequest.id.like(f"%{clean_id}"))
            | (SubscriptionRequest.member_code == clean_id)
            | (SubscriptionRequest.member_code == s),
            SubscriptionRequest.status == "pending",
        )
        .first()
    )


@router.get("/requests/{branch_id}", response_model=List[PendingRequestListItem])
def get_pending_requests(
    branch_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Admin: Get all subscription requests for a specific branch directly from database."""
    query = db.query(SubscriptionRequest).filter(
        SubscriptionRequest.branch_id == branch_id,
    )
    if status and status.lower() != "all":
        query = query.filter(SubscriptionRequest.status == status.lower())

    requests_list = query.order_by(SubscriptionRequest.created_at.desc()).all()

    results = []
    for req in requests_list:
        clean_req_id = req.id.replace("req-", "")
        # Preserve original clean string if it has leading zeros, or use integer if clean
        req_id_val = clean_req_id

        code_val = req.member_code
        if not code_val and req.member_id:
            m = db.query(Member).filter(Member.id == req.member_id).first()
            if m:
                code_val = m.member_code or m.id.replace("mem-", "")
        if not code_val:
            code_val = req_id_val

        code_num = code_val

        results.append(
            PendingRequestListItem(
                request_id=req_id_val,
                branch_id=req.branch_id or 1,
                member_name=req.full_name,
                member_code=code_num,
                request_type=req.request_type or "new",
                duration=req.duration or 1,
                paid_amount=req.paid_amount if req.paid_amount is not None else (req.price or 0.0),
                payment_method=req.payment_method or "Visa",
                email=req.email,
                phone=req.phone,
                plan_id=req.plan_id,
                plan_name=req.plan_name,
                requested_start_date=req.requested_start_date,
                status=req.status or "pending",
                notes=req.notes,
                created_at=req.created_at.isoformat() if req.created_at else None,
            )
        )

    return results


@router.get("/request/{request_id}")
def get_request_details(
    request_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Admin: Get full details of a specific pending request."""
    search_id = str(request_id)
    req = find_pending_request(search_id, db)

    if not req:
        return JSONResponse(status_code=404, content={"message": "request not found"})

    clean_req_id = req.id.replace("req-", "")
    req_id_val = clean_req_id

    mem_id = req.member_id or req.member_code or req_id_val
    clean_mem_id = str(mem_id).replace("mem-", "")
    mem_id_val = int(clean_mem_id) if clean_mem_id.isdigit() else mem_id

    start_date = req.requested_start_date or date.today().strftime("%Y-%m-%d")
    duration = req.duration or 1
    if req.end_date:
        end_date = req.end_date
    else:
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
        except Exception:
            start_date_obj = date.today()
        end_date_obj = start_date_obj + timedelta(days=duration * 30 - 1)
        end_date = end_date_obj.strftime("%Y-%m-%d")

    return {
        "request_id": req_id_val,
        "branch_id": req.branch_id,
        "request_type": req.request_type or "new",
        "status": req.status,
        "member_data": {
            "name": req.full_name,
            "member_id": mem_id_val,
            "email": req.email,
            "phone": req.phone,
        },
        "subscription_data": {
            "start_date": start_date,
            "end_date": end_date,
            "duration": duration,
            "price": req.price if req.price is not None else 0.0,
            "paid_amount": req.paid_amount if req.paid_amount is not None else 0.0,
            "payment_method": req.payment_method or "Visa",
            "plan_id": req.plan_id,
            "plan_name": req.plan_name,
            "notes": req.notes,
        },
    }


@router.post("/request/{request_id}/approve")
def approve_request(
    request_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Admin: Approve a pending request (new, renew, extend, cancel)."""
    search_id = str(request_id)
    req = find_pending_request(search_id, db)

    if not req:
        # Check if already approved
        clean_id = search_id.replace("req-", "")
        already_approved = (
            db.query(SubscriptionRequest)
            .filter(
                (SubscriptionRequest.id == search_id)
                | (SubscriptionRequest.id == f"req-{search_id}")
                | (SubscriptionRequest.id == f"req-{clean_id}")
                | (SubscriptionRequest.id == clean_id)
                | (SubscriptionRequest.id.like(f"%{clean_id}")),
                SubscriptionRequest.status == "approved",
            )
            .first()
        )
        if already_approved:
            return {"message": "Request already approved"}
        return JSONResponse(status_code=404, content={"message": "Request not found"})

    req_type = (req.request_type or "new").lower()
    today_str = date.today().strftime("%Y-%m-%d")

    try:
        # 1. NEW
        if req_type == "new":
            existing_member = (
                db.query(Member)
                .filter((Member.email == req.email) | (Member.phone == req.phone))
                .first()
            )
            if existing_member:
                if req.full_name:
                    existing_member.full_name = req.full_name
                if req.email:
                    existing_member.email = req.email
                if req.phone:
                    existing_member.phone = req.phone
                existing_member.status = "active"
                existing_member.join_date = req.requested_start_date or today_str
                new_sub_id = f"sub-{random.randint(1000, 9999)}"
                existing_member.subscription_id = new_sub_id
                existing_member.plan_name = req.plan_name
                if req.notes:
                    existing_member.note = req.notes
                req.member_id = existing_member.id

                new_pay = Payment(
                    branch_id=req.branch_id,
                    member_id=existing_member.id,
                    member_name=req.full_name or existing_member.full_name,
                    subscription_id=new_sub_id,
                    amount=req.paid_amount if req.paid_amount is not None else (req.price or 0.0),
                    date=today_str,
                    method=req.payment_method or "Visa",
                    status="paid",
                )
                db.add(new_pay)
            else:
                # Generate random member code and barcode
                random_code = str(random.randint(100, 9999))
                random_barcode = "".join([str(random.randint(0, 9)) for _ in range(9)])
                new_sub_id = f"sub-{random.randint(1000, 9999)}"

                new_member = Member(
                    branch_id=req.branch_id,
                    member_code=random_code,
                    barcode=random_barcode,
                    full_name=req.full_name,
                    email=req.email,
                    phone=req.phone,
                    join_date=req.requested_start_date or today_str,
                    subscription_id=new_sub_id,
                    plan_name=req.plan_name,
                    status="active",
                    note=req.notes,
                )
                db.add(new_member)
                db.flush()
                req.member_id = new_member.id

                # Record payment
                new_pay = Payment(
                    branch_id=req.branch_id,
                    member_id=new_member.id,
                    member_name=req.full_name,
                    subscription_id=new_sub_id,
                    amount=req.paid_amount if req.paid_amount is not None else (req.price or 0.0),
                    date=today_str,
                    method=req.payment_method or "Visa",
                    status="paid",
                )
                db.add(new_pay)

        # 2. RENEW
        elif req_type == "renew":
            member = None
            if req.member_id:
                member = db.query(Member).filter((Member.id == str(req.member_id)) | (Member.id == f"mem-{req.member_id}")).first()
            if not member:
                member = db.query(Member).filter(Member.phone == req.phone).first()

            if member:
                if req.full_name:
                    member.full_name = req.full_name
                member.status = "active"
                member.join_date = req.requested_start_date or today_str
                new_sub_id = f"sub-{random.randint(1000, 9999)}"
                member.subscription_id = new_sub_id
                if req.plan_name:
                    member.plan_name = req.plan_name

                new_pay = Payment(
                    branch_id=req.branch_id,
                    member_id=member.id,
                    member_name=req.full_name or member.full_name,
                    subscription_id=new_sub_id,
                    amount=req.paid_amount if req.paid_amount is not None else (req.price or 0.0),
                    date=today_str,
                    method=req.payment_method or "Visa",
                    status="paid",
                )
                db.add(new_pay)

        # 3. EXTEND
        elif req_type == "extend":
            member = None
            if req.member_id:
                member = db.query(Member).filter((Member.id == str(req.member_id)) | (Member.id == f"mem-{req.member_id}")).first()
            if not member:
                member = db.query(Member).filter(Member.phone == req.phone).first()

            if member:
                if req.full_name:
                    member.full_name = req.full_name
                new_sub_id = f"sub-{random.randint(1000, 9999)}"
                new_pay = Payment(
                    branch_id=req.branch_id,
                    member_id=member.id,
                    member_name=req.full_name or member.full_name,
                    subscription_id=new_sub_id,
                    amount=req.paid_amount if req.paid_amount is not None else (req.price or 0.0),
                    date=today_str,
                    method=req.payment_method or "Visa",
                    status="paid",
                )
                db.add(new_pay)

        # 4. CANCEL
        elif req_type == "cancel":
            member = None
            if req.member_id:
                member = db.query(Member).filter((Member.id == str(req.member_id)) | (Member.id == f"mem-{req.member_id}")).first()
            if not member:
                member = db.query(Member).filter(Member.phone == req.phone).first()

            if member:
                member.status = "expired"


        else:
            return JSONResponse(status_code=400, content={"message": "Invalid request type"})

        req.status = "approved"
        db.commit()

        return {"message": "Request approved successfully"}

    except Exception as e:
        db.rollback()
        return JSONResponse(status_code=500, content={"message": str(e)})


@router.post("/request/{request_id}/reject")
def reject_request(
    request_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Admin: Reject a pending request."""
    search_id = str(request_id)
    req = find_pending_request(search_id, db)

    if not req:
        return JSONResponse(status_code=404, content={"message": "Request not found"})

    req.status = "rejected"
    db.commit()

    return {"message": "Request rejected successfully"}
