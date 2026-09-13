from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.trainer import Trainer
from app.models.user import User
from app.schemas.trainer import TrainerCreate, TrainerUpdate, TrainerResponse

router = APIRouter(prefix="/trainers", tags=["Trainers"])


@router.get("", response_model=List[TrainerResponse])
def get_trainers(db: Session = Depends(get_db)):
    """List all fitness coaches and personal trainers."""
    return db.query(Trainer).all()


@router.get("/{trainer_id}", response_model=TrainerResponse)
def get_trainer(trainer_id: str, db: Session = Depends(get_db)):
    """Get single trainer profile."""
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return trainer


@router.post("", response_model=TrainerResponse, status_code=status.HTTP_201_CREATED)
def create_trainer(
    trainer_in: TrainerCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin"])),
):
    """Add a new gym trainer (Admin only)."""
    new_trainer = Trainer(
        full_name=trainer_in.full_name,
        specialty=trainer_in.specialty,
        bio=trainer_in.bio,
        hourly_rate=trainer_in.hourly_rate,
        phone=trainer_in.phone,
        email=trainer_in.email,
        photo_url=trainer_in.photo_url,
        is_available=trainer_in.is_available,
        assigned_members_count=trainer_in.assigned_members_count,
    )
    db.add(new_trainer)
    db.commit()
    db.refresh(new_trainer)
    return new_trainer


@router.put("/{trainer_id}", response_model=TrainerResponse)
def update_trainer(
    trainer_id: str,
    trainer_in: TrainerUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin"])),
):
    """Update trainer details (Admin only)."""
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    update_data = trainer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trainer, field, value)

    db.commit()
    db.refresh(trainer)
    return trainer


@router.delete("/{trainer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trainer(
    trainer_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin"])),
):
    """Remove a trainer (Admin only)."""
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    db.delete(trainer)
    db.commit()
    return None
