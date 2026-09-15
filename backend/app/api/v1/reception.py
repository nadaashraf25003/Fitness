from datetime import datetime, date, timedelta, timezone
from typing import Optional, Union, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.models.branch import Branch
from app.models.member import Member
from app.models.attendance import Attendance
from app.models.plan import Plan
from app.models.subscription_request import SubscriptionRequest
from app.schemas.reception import (
    ReceptionLoginRequest,
    ReceptionSearchRequest,
    ReceptionAttendanceRequest,
    CreateRequestPayload,
)

router = APIRouter(tags=["Reception Module"])


# -------------------------------------------------------------
# 0. Check Email Availability (Public & Registration)
# -------------------------------------------------------------
@router.get("/check-email")
@router.post("/check-email")
def check_email_availability(
    email: Optional[str] = Query(None, description="Email to check for existence"),
    payload: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
):
    """Check whether an email already exists in members, subscription requests, or user accounts."""
    target_email = email
    if not target_email and payload:
        target_email = payload.get("email")

    if not target_email or not str(target_email).strip():
        return JSONResponse(
            status_code=400,
            content={"exists": False, "reason": "none", "message": "Email address is required"},
        )

    clean_email = str(target_email).strip().lower()

    # 1. Check existing Member record
    existing_member = db.query(Member).filter(Member.email.ilike(clean_email)).first()
    if existing_member:
        sub_dict, is_active, is_expired = get_member_subscription_details(existing_member)
        mem_code = existing_member.member_code if existing_member.member_code else str(existing_member.id).replace("mem-", "")
        return {
            "exists": True,
            "reason": "member",
            "message": f"A registered member account with '{clean_email}' already exists.",
            "member": {
                "id": existing_member.id,
                "member_code": mem_code,
                "name": existing_member.full_name,
                "status": existing_member.status,
                "is_active": is_active,
                "plan_name": existing_member.plan_name,
            },
        }

    # 2. Check pending / approved Subscription Request
    existing_req = (
        db.query(SubscriptionRequest)
        .filter(
            SubscriptionRequest.email.ilike(clean_email),
            SubscriptionRequest.status.in_(["pending", "approved"]),
        )
        .first()
    )
    if existing_req:
        req_id_clean = existing_req.id.replace("req-", "")
        return {
            "exists": True,
            "reason": "request",
            "message": f"A subscription application for '{clean_email}' is currently {existing_req.status}.",
            "request": {
                "id": existing_req.id,
                "request_id": req_id_clean,
                "name": existing_req.full_name,
                "status": existing_req.status,
                "plan_name": existing_req.plan_name,
                "requested_start_date": existing_req.requested_start_date,
            },
        }

    # 3. Check portal user accounts (admin/staff)
    existing_user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing_user:
        return {
            "exists": True,
            "reason": "user",
            "message": f"This email is registered as an administrative staff portal account.",
        }

    # 4. Email is free and available
    return {
        "exists": False,
        "reason": "none",
        "message": "Email is available for registration.",
    }


def get_member_subscription_details(member: Member) -> tuple[Optional[Dict[str, Any]], bool, bool]:
    """Calculate subscription details, active flag, and expired flag."""
    if not member or not member.join_date:
        return None, False, False

    try:
        start_date_obj = datetime.strptime(member.join_date, "%Y-%m-%d").date()
    except Exception:
        start_date_obj = date.today()

    duration = 1  # 1 month standard default
    end_date_obj = start_date_obj + timedelta(days=30)
    today = date.today()

    is_expired = today > end_date_obj or member.status == "expired"
    is_active = (member.status == "active") and not is_expired
    remaining_days = max(0, (end_date_obj - today).days) if is_active else 0

    sub_id = member.subscription_id
    if isinstance(sub_id, str) and sub_id.startswith("sub-"):
        clean_sub_id = sub_id.replace("sub-", "")
        sub_id_val = int(clean_sub_id) if clean_sub_id.isdigit() else 1
    else:
        sub_id_val = 1

    sub_dict = {
        "id": sub_id_val,
        "start_date": start_date_obj.strftime("%Y-%m-%d"),
        "end_date": end_date_obj.strftime("%Y-%m-%d"),
        "duration": duration,
        "status": "active" if is_active else "expired",
        "remaining_days": remaining_days,
    }

    return sub_dict, is_active, is_expired


# -------------------------------------------------------------
# 1. Reception Login
# -------------------------------------------------------------
@router.post("/reception/login")
def reception_login(payload: Optional[ReceptionLoginRequest] = None, db: Session = Depends(get_db)):
    """Reception employee login."""
    if payload is None:
        return JSONResponse(status_code=400, content={"message": "Request body is required"})

    if not payload.email or not payload.password:
        return JSONResponse(status_code=400, content={"message": "Email and password are required"})

    email_clean = payload.email.lower().strip()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        return JSONResponse(status_code=401, content={"message": "Invalid email or password"})

    token = create_access_token(subject=user.id)
    user_id_clean = user.id.replace("u-", "").replace("admin-", "").replace("staff-", "")
    user_id_val = int(user_id_clean) if user_id_clean.isdigit() else 1

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user_id_val,
            "email": user.email,
            "role": "reception" if user.role in ["staff", "reception"] else user.role,
        },
    }


# -------------------------------------------------------------
# 2. Member Search
# -------------------------------------------------------------
@router.post("/reception/member/search")
def reception_member_search(
    payload: Optional[ReceptionSearchRequest] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Search for a member by member_code OR phone number."""
    if payload is None:
        return JSONResponse(status_code=400, content={"message": "Request body is required"})

    if payload.branch_id is None:
        return JSONResponse(status_code=400, content={"message": "branch_id is required"})

    has_code = bool(payload.member_code and payload.member_code.strip())
    has_phone = bool(payload.phone and payload.phone.strip())

    if not has_code and not has_phone:
        return JSONResponse(status_code=400, content={"message": "member_code or phone is required"})

    if has_code and has_phone:
        return JSONResponse(status_code=400, content={"message": "Send member_code or phone, not both"})

    query = db.query(Member).filter(Member.branch_id == payload.branch_id)
    if has_code:
        code_val = payload.member_code.strip()
        query = query.filter((Member.member_code == code_val) | (Member.id == code_val) | (Member.id == f"mem-{code_val}"))
    else:
        phone_val = payload.phone.strip()
        query = query.filter(Member.phone == phone_val)

    member = query.first()
    if not member:
        return JSONResponse(status_code=404, content={"message": "Member not found"})

    sub_dict, is_active, _ = get_member_subscription_details(member)
    mem_code = member.member_code if member.member_code else str(member.id).replace("mem-", "")
    mem_id_val = int(mem_code) if mem_code.isdigit() else member.id

    return {
        "message": "Member found successfully",
        "member": {
            "id": mem_id_val,
            "member_code": mem_code,
            "name": member.full_name,
            "phone": member.phone,
            "photo": member.photo or member.photo_url or "",
            "note": member.note or "",
            "branch_id": member.branch_id,
        },
        "subscription": sub_dict if is_active else None,
    }


# -------------------------------------------------------------
# 3. Attendance / Check-In
# -------------------------------------------------------------
@router.post("/reception/attendance")
def reception_attendance_checkin(
    payload: Optional[ReceptionAttendanceRequest] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Record member attendance by member_code OR barcode."""
    if payload is None:
        return JSONResponse(status_code=400, content={"message": "Request body is required"})

    if payload.branch_id is None:
        return JSONResponse(status_code=400, content={"message": "branch_id is required"})

    has_code = bool(payload.member_code and payload.member_code.strip())
    has_barcode = bool(payload.barcode and payload.barcode.strip())

    if not has_code and not has_barcode:
        return JSONResponse(status_code=400, content={"message": "member_code or barcode is required"})

    if has_code and has_barcode:
        return JSONResponse(status_code=400, content={"message": "Send member_code or barcode, not both"})

    query = db.query(Member).filter(Member.branch_id == payload.branch_id)
    if has_code:
        code_val = payload.member_code.strip()
        query = query.filter((Member.member_code == code_val) | (Member.id == code_val) | (Member.id == f"mem-{code_val}"))
    else:
        barcode_val = payload.barcode.strip()
        query = query.filter((Member.barcode == barcode_val) | (Member.member_code == barcode_val))

    member = query.first()
    if not member:
        return JSONResponse(status_code=404, content={"message": "Member not found"})

    mem_code = member.member_code if member.member_code else str(member.id).replace("mem-", "")
    mem_id_val = int(mem_code) if mem_code.isdigit() else member.id

    member_response_data = {
        "id": mem_id_val,
        "member_code": mem_code,
        "name": member.full_name,
        "phone": member.phone,
        "photo": member.photo or member.photo_url or "",
        "note": member.note or "",
    }

    sub_dict, is_active, is_expired = get_member_subscription_details(member)

    # Check 1: No active subscription
    if not is_active and not is_expired:
        return JSONResponse(
            status_code=403,
            content={
                "message": "Member does not have an active subscription",
                "member": member_response_data,
            },
        )

    # Check 2: Expired subscription
    if is_expired:
        return JSONResponse(
            status_code=403,
            content={
                "message": "Subscription has expired",
                "member": member_response_data,
                "subscription": sub_dict,
            },
        )

    # Check 3: Already checked in today
    today_str = date.today().strftime("%Y-%m-%d")
    existing_att = (
        db.query(Attendance)
        .filter(
            Attendance.member_id == member.id,
            Attendance.date == today_str,
        )
        .first()
    )

    if existing_att:
        att_id_clean = existing_att.id.replace("att-", "")
        att_id_val = int(att_id_clean) if att_id_clean.isdigit() else 100
        return JSONResponse(
            status_code=409,
            content={
                "message": "Member has already checked in today",
                "attendance": {
                    "id": att_id_val,
                    "check_in": f"{existing_att.date}T{existing_att.check_in_time}:00",
                },
                "member": member_response_data,
            },
        )

    # Record attendance
    now = datetime.now()
    new_att = Attendance(
        branch_id=payload.branch_id,
        member_id=member.id,
        member_name=member.full_name,
        check_in_time=now.strftime("%H:%M"),
        date=now.strftime("%Y-%m-%d"),
    )
    db.add(new_att)
    db.commit()
    db.refresh(new_att)

    att_id_clean = new_att.id.replace("att-", "")
    att_id_val = int(att_id_clean) if att_id_clean.isdigit() else 100

    return JSONResponse(
        status_code=201,
        content={
            "message": "Attendance recorded successfully",
            "attendance": {
                "id": att_id_val,
                "check_in": now.strftime("%Y-%m-%dT%H:%M:%S"),
            },
            "member": member_response_data,
            "subscription": sub_dict,
        },
    )


# -------------------------------------------------------------
# -------------------------------------------------------------
# 4. Create Subscription Request
# -------------------------------------------------------------
@router.post("/request")
def create_subscription_request(
    payload: Optional[CreateRequestPayload] = None,
    db: Session = Depends(get_db),
):
    """Create a pending request for Admin approval (new, renew, extend, cancel)."""
    if payload is None:
        return JSONResponse(status_code=400, content={"message": "Request body is required"})

    request_type = (payload.request_type or "").lower().strip()
    if request_type not in ["new", "renew", "extend", "cancel"]:
        return JSONResponse(status_code=400, content={"message": "Invalid request type"})

    branch_id = payload.branch_id or 1
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        return JSONResponse(status_code=404, content={"message": "Branch not found"})

    # --- TYPE: NEW ---
    if request_type == "new":
        if not payload.member or not isinstance(payload.member, dict):
            return JSONResponse(status_code=400, content={"message": "member is required"})

        name = payload.member.get("name") or payload.member.get("fullName")
        phone = payload.member.get("phone")
        email = payload.member.get("email") or f"{phone}@gym.com"
        photo = payload.member.get("photo", "")
        member_notes = payload.member.get("notes") or ""

        if not name:
            return JSONResponse(status_code=400, content={"message": "name is required"})
        if not phone:
            return JSONResponse(status_code=400, content={"message": "phone is required"})

        # Guard: Check for duplicate email in existing members or pending requests
        if email and not email.endswith("@gym.com"):
            clean_email = email.strip().lower()
            existing_member = db.query(Member).filter(Member.email.ilike(clean_email)).first()
            if existing_member:
                return JSONResponse(
                    status_code=400,
                    content={"message": f"A member with email '{email}' already exists. Please track status or login."}
                )
            existing_req = (
                db.query(SubscriptionRequest)
                .filter(
                    SubscriptionRequest.email.ilike(clean_email),
                    SubscriptionRequest.status == "pending",
                )
                .first()
            )
            if existing_req:
                return JSONResponse(
                    status_code=409,
                    content={"message": f"A pending application for '{email}' is already in review."}
                )

        if not payload.subscription or not isinstance(payload.subscription, dict):
            return JSONResponse(status_code=400, content={"message": "Subscription data is required"})

        start_date_str = (
            payload.subscription.get("start_date")
            or payload.subscription.get("requestedStartDate")
            or date.today().strftime("%Y-%m-%d")
        )
        duration_raw = (
            payload.subscription.get("duration")
            or payload.subscription.get("durationMonths")
            or payload.subscription.get("duration_months")
            or 1
        )
        try:
            duration = int(duration_raw)
        except Exception:
            duration = 1

        if duration <= 0:
            duration = 1

        try:
            start_date_obj = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        except ValueError:
            start_date_obj = date.today()
            start_date_str = start_date_obj.strftime("%Y-%m-%d")

        end_date_obj = start_date_obj + timedelta(days=duration * 30 - 1)
        end_date_str = end_date_obj.strftime("%Y-%m-%d")

        plan_id = payload.subscription.get("plan_id") or payload.subscription.get("planId")
        plan_name = payload.subscription.get("plan_name") or payload.subscription.get("planName")

        if not plan_name and plan_id:
            plan_obj = db.query(Plan).filter(Plan.id == plan_id).first()
            if plan_obj:
                plan_name = plan_obj.name

        if not plan_name:
            if duration == 1:
                plan_name = "Basic Monthly"
            elif duration == 3:
                plan_name = "Pro 3-Month"
            elif duration == 12:
                plan_name = "VIP Annual"
            else:
                plan_name = f"Plan {duration} Month(s)"

        if not plan_id:
            if duration == 1:
                plan_id = "plan-basic"
            elif duration == 3:
                plan_id = "plan-pro"
            elif duration == 12:
                plan_id = "plan-vip"
            else:
                plan_id = f"plan-{duration}"

        price_raw = payload.subscription.get("price")
        paid_amount_raw = (
            payload.subscription.get("paid_amount")
            if payload.subscription.get("paid_amount") is not None
            else payload.subscription.get("paidAmount")
        )

        if price_raw is not None:
            price = float(price_raw)
        elif duration == 1:
            price = 29.99
        elif duration == 3:
            price = 79.99
        elif duration == 12:
            price = 249.99
        else:
            price = round(50.0 * duration, 2)

        if paid_amount_raw is not None:
            paid_amount = float(paid_amount_raw)
        else:
            paid_amount = price

        payment_method = (
            payload.subscription.get("payment_method")
            or payload.subscription.get("paymentMethod")
            or "Visa"
        )
        sub_notes = payload.subscription.get("notes") or ""
        combined_notes = (
            member_notes
            if (member_notes and member_notes == sub_notes)
            else f"{member_notes} {sub_notes}".strip()
        ) or None

        new_req = SubscriptionRequest(
            branch_id=branch_id,
            full_name=name,
            email=email,
            phone=phone,
            plan_id=plan_id,
            plan_name=plan_name,
            requested_start_date=start_date_str,
            end_date=end_date_str,
            duration=duration,
            price=price,
            paid_amount=paid_amount,
            payment_method=payment_method,
            notes=combined_notes,
            request_type="new",
            status="pending",
        )
        db.add(new_req)
        db.commit()
        db.refresh(new_req)

        req_id_clean = new_req.id.replace("req-", "")
        req_id_val = int(req_id_clean) if req_id_clean.isdigit() else new_req.id

        return JSONResponse(
            status_code=201,
            content={
                "message": "Request created successfully",
                "request_id": req_id_val,
                "request_for_admin": {
                    "request_id": req_id_val,
                    "member_name": name,
                    "member_code": req_id_val,
                    "request_type": "new",
                    "duration": duration,
                    "paid_amount": paid_amount,
                    "payment_method": payment_method,
                    "email": email,
                    "phone": phone,
                    "plan_id": plan_id,
                    "plan_name": plan_name,
                    "requested_start_date": start_date_str,
                    "notes": combined_notes,
                },
                "request_for_subscription": {
                    "start_date": start_date_str,
                    "end_date": end_date_str,
                    "duration": duration,
                    "price": price,
                    "paid_amount": paid_amount,
                    "payment_method": payment_method,
                },
            },
        )

    # --- TYPE: RENEW, EXTEND, CANCEL (Require existing member) ---
    if payload.member_id is None:
        return JSONResponse(status_code=400, content={"message": "Member ID is required"})

    # Find member by ID or code
    mem_search_str = str(payload.member_id)
    member = (
        db.query(Member)
        .filter(
            (Member.id == mem_search_str) | (Member.id == f"mem-{mem_search_str}") | (Member.member_code == mem_search_str)
        )
        .first()
    )

    if not member:
        return JSONResponse(status_code=404, content={"message": "Member not found"})

    if member.branch_id != branch_id:
        return JSONResponse(status_code=403, content={"message": "Member belongs to another branch"})

    # Check pending request already exists
    pending_req = (
        db.query(SubscriptionRequest)
        .filter(
            SubscriptionRequest.phone == member.phone,
            SubscriptionRequest.status == "pending",
        )
        .first()
    )
    if pending_req:
        return JSONResponse(status_code=409, content={"message": "This member already has a pending request"})

    sub_dict, is_active, is_expired = get_member_subscription_details(member)

    # --- TYPE: RENEW ---
    if request_type == "renew":
        if is_active:
            return JSONResponse(status_code=400, content={"message": "Member already has an active subscription"})

        if not payload.subscription or not isinstance(payload.subscription, dict):
            return JSONResponse(status_code=400, content={"message": "Subscription data is required"})

        start_date_str = payload.subscription.get("start_date") or date.today().strftime("%Y-%m-%d")
        duration = int(payload.subscription.get("duration", 1))
        price = float(payload.subscription.get("price", 500))
        paid_amount = float(payload.subscription.get("paid_amount", price))
        payment_method = payload.subscription.get("payment_method", "Visa")
        plan_name = payload.subscription.get("plan_name") or f"Renewal {duration} Month(s)"
        plan_id = payload.subscription.get("plan_id") or "plan-renew"

        try:
            start_date_obj = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        except ValueError:
            start_date_obj = date.today()
            start_date_str = start_date_obj.strftime("%Y-%m-%d")

        end_date_obj = start_date_obj + timedelta(days=duration * 30 - 1)
        end_date_str = end_date_obj.strftime("%Y-%m-%d")

        new_req = SubscriptionRequest(
            branch_id=branch_id,
            member_id=member.id,
            member_code=member.member_code,
            full_name=member.full_name,
            email=member.email,
            phone=member.phone,
            plan_id=plan_id,
            plan_name=plan_name,
            requested_start_date=start_date_str,
            end_date=end_date_str,
            duration=duration,
            price=price,
            paid_amount=paid_amount,
            payment_method=payment_method,
            notes=member.note,
            request_type="renew",
            status="pending",
        )
        db.add(new_req)
        db.commit()
        db.refresh(new_req)

        req_id_clean = new_req.id.replace("req-", "")
        req_id_val = int(req_id_clean) if req_id_clean.isdigit() else new_req.id
        mem_code = int(member.member_code) if (member.member_code and member.member_code.isdigit()) else (member.member_code or 15)

        return JSONResponse(
            status_code=201,
            content={
                "message": "Request created successfully",
                "request_id": req_id_val,
                "request_for_admin": {
                    "request_id": req_id_val,
                    "member_name": member.full_name,
                    "member_code": mem_code,
                    "request_type": "renew",
                    "duration": duration,
                    "paid_amount": paid_amount,
                    "payment_method": payment_method,
                    "email": member.email,
                    "phone": member.phone,
                    "plan_id": plan_id,
                    "plan_name": plan_name,
                },
                "request_for_subscription": {
                    "start_date": start_date_str,
                    "end_date": end_date_str,
                    "duration": duration,
                    "price": price,
                    "paid_amount": paid_amount,
                    "payment_method": payment_method,
                },
            },
        )

    # --- TYPE: EXTEND ---
    elif request_type == "extend":
        if not payload.subscription or not isinstance(payload.subscription, dict):
            return JSONResponse(status_code=400, content={"message": "Subscription data is required"})

        duration = int(payload.subscription.get("duration", 1))
        price = float(payload.subscription.get("price", 500))
        paid_amount = float(payload.subscription.get("paid_amount", price))
        payment_method = payload.subscription.get("payment_method", "Visa")
        plan_name = payload.subscription.get("plan_name") or f"Extension {duration} Month(s)"
        plan_id = payload.subscription.get("plan_id") or "plan-extend"

        if sub_dict:
            last_end = datetime.strptime(sub_dict["end_date"], "%Y-%m-%d").date()
            start_date_obj = last_end + timedelta(days=1)
        else:
            start_date_obj = date.today()

        end_date_obj = start_date_obj + timedelta(days=duration * 30 - 1)

        start_date_str = start_date_obj.strftime("%Y-%m-%d")
        end_date_str = end_date_obj.strftime("%Y-%m-%d")

        new_req = SubscriptionRequest(
            branch_id=branch_id,
            member_id=member.id,
            member_code=member.member_code,
            full_name=member.full_name,
            email=member.email,
            phone=member.phone,
            plan_id=plan_id,
            plan_name=plan_name,
            requested_start_date=start_date_str,
            end_date=end_date_str,
            duration=duration,
            price=price,
            paid_amount=paid_amount,
            payment_method=payment_method,
            notes=member.note,
            request_type="extend",
            status="pending",
        )
        db.add(new_req)
        db.commit()
        db.refresh(new_req)

        req_id_clean = new_req.id.replace("req-", "")
        req_id_val = int(req_id_clean) if req_id_clean.isdigit() else new_req.id
        mem_code = int(member.member_code) if (member.member_code and member.member_code.isdigit()) else (member.member_code or 15)

        return JSONResponse(
            status_code=201,
            content={
                "message": "Request created successfully",
                "request_id": req_id_val,
                "request_for_admin": {
                    "request_id": req_id_val,
                    "member_name": member.full_name,
                    "member_code": mem_code,
                    "request_type": "extend",
                    "duration": duration,
                    "paid_amount": paid_amount,
                    "payment_method": payment_method,
                    "email": member.email,
                    "phone": member.phone,
                    "plan_id": plan_id,
                    "plan_name": plan_name,
                },
                "request_for_subscription": {
                    "start_date": start_date_str,
                    "end_date": end_date_str,
                    "duration": duration,
                    "price": price,
                    "paid_amount": paid_amount,
                    "payment_method": payment_method,
                },
            },
        )

    # --- TYPE: CANCEL ---
    elif request_type == "cancel":
        if not is_active:
            return JSONResponse(status_code=400, content={"message": "No active subscription found"})

        new_req = SubscriptionRequest(
            branch_id=branch_id,
            member_id=member.id,
            member_code=member.member_code,
            full_name=member.full_name,
            email=member.email,
            phone=member.phone,
            plan_id="cancel",
            plan_name="Cancellation Request",
            requested_start_date=date.today().strftime("%Y-%m-%d"),
            duration=0,
            price=0.0,
            paid_amount=0.0,
            payment_method="N/A",
            notes=member.note,
            request_type="cancel",
            status="pending",
        )
        db.add(new_req)
        db.commit()
        db.refresh(new_req)

        req_id_clean = new_req.id.replace("req-", "")
        req_id_val = int(req_id_clean) if req_id_clean.isdigit() else new_req.id
        mem_code = int(member.member_code) if (member.member_code and member.member_code.isdigit()) else (member.member_code or 15)

        return JSONResponse(
            status_code=201,
            content={
                "message": "Request created successfully",
                "request_id": req_id_val,
                "request_for_admin": {
                    "request_id": req_id_val,
                    "member_name": member.full_name,
                    "member_code": mem_code,
                    "request_type": "cancel",
                    "duration": 0,
                    "paid_amount": 0,
                    "payment_method": "N/A",
                    "email": member.email,
                    "phone": member.phone,
                    "plan_name": "Cancellation Request",
                },
                "request_for_subscription": {
                    "start_date": sub_dict["start_date"] if sub_dict else date.today().strftime("%Y-%m-%d"),
                    "end_date": sub_dict["end_date"] if sub_dict else date.today().strftime("%Y-%m-%d"),
                    "duration": sub_dict["duration"] if sub_dict else 0,
                    "price": 0,
                    "paid_amount": 0,
                    "payment_method": "N/A",
                },
            },
        )

