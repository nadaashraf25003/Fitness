from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.measurement import Measurement
from app.models.member import Member
from app.models.user import User
from app.schemas.measurement import MeasurementCreate, MeasurementResponse

router = APIRouter(prefix="/measurements", tags=["Measurements"])


def calculate_bmi(weight_kg: float, height_cm: float) -> tuple[float, str]:
    """Calculate BMI and category from weight (kg) and height (cm)."""
    height_m = height_cm / 100.0
    if height_m <= 0:
        return 0.0, "normal"
    bmi = round(weight_kg / (height_m * height_m), 1)
    if bmi < 18.5:
        category = "underweight"
    elif bmi < 25.0:
        category = "normal"
    elif bmi < 30.0:
        category = "overweight"
    else:
        category = "obese"
    return bmi, category


@router.get("/member/{member_id}", response_model=List[MeasurementResponse])
def get_member_measurements(
    member_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Get all historical measurement logs for a member."""
    return db.query(Measurement).filter(Measurement.member_id == member_id).order_by(Measurement.date.asc()).all()


@router.post("", response_model=MeasurementResponse, status_code=status.HTTP_201_CREATED)
def create_measurement(
    data: MeasurementCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Add new body composition log for a member (Auto-computes BMI & Category)."""
    member = db.query(Member).filter(Member.id == data.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    bmi, bmi_category = calculate_bmi(data.weight_kg, data.height_cm)

    new_meas = Measurement(
        member_id=data.member_id,
        date=data.date,
        weight_kg=data.weight_kg,
        height_cm=data.height_cm,
        body_fat_percentage=data.body_fat_percentage,
        chest_cm=data.chest_cm,
        waist_cm=data.waist_cm,
        hips_cm=data.hips_cm,
        arms_cm=data.arms_cm,
        thighs_cm=data.thighs_cm,
        bmi=bmi,
        bmi_category=bmi_category,
        notes=data.notes,
    )
    db.add(new_meas)
    db.commit()
    db.refresh(new_meas)
    return new_meas


@router.delete("/{measurement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_measurement(
    measurement_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Delete an erroneous measurement entry."""
    entry = db.query(Measurement).filter(Measurement.id == measurement_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Measurement entry not found")
    db.delete(entry)
    db.commit()
    return None
