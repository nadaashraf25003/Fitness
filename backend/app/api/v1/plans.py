from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.plan import Plan
from app.models.user import User
from app.schemas.plan import PlanCreate, PlanUpdate, PlanResponse

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.get("", response_model=List[PlanResponse])
def get_plans(db: Session = Depends(get_db)):
    """List all available gym subscription plans."""
    return db.query(Plan).filter(Plan.is_active == True).all()


@router.get("/{plan_id}", response_model=PlanResponse)
def get_plan(plan_id: str, db: Session = Depends(get_db)):
    """Get single plan by ID."""
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.post("", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    plan_in: PlanCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin"])),
):
    """Create a new membership package (Admin only)."""
    new_plan = Plan(
        name=plan_in.name,
        price=plan_in.price,
        duration_months=plan_in.duration_months,
        features=plan_in.features,
        is_popular=plan_in.is_popular,
        is_active=plan_in.is_active,
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan


@router.put("/{plan_id}", response_model=PlanResponse)
def update_plan(
    plan_id: str,
    plan_in: PlanUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin"])),
):
    """Update membership package details (Admin only)."""
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    update_data = plan_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin"])),
):
    """Deactivate or delete a plan (Admin only)."""
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()
    return None
