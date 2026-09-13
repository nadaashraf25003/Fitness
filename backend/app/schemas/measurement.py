from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

BMICategory = Literal["underweight", "normal", "overweight", "obese"]


class MeasurementCreate(BaseModel):
    member_id: str
    date: str
    weight_kg: float
    height_cm: float
    body_fat_percentage: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hips_cm: Optional[float] = None
    arms_cm: Optional[float] = None
    thighs_cm: Optional[float] = None
    notes: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class MeasurementResponse(BaseModel):
    id: str
    member_id: str
    date: str
    weight_kg: float
    height_cm: float
    body_fat_percentage: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hips_cm: Optional[float] = None
    arms_cm: Optional[float] = None
    thighs_cm: Optional[float] = None
    bmi: float
    bmi_category: BMICategory
    notes: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
