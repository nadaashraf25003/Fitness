from typing import Optional
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CheckInRequest(BaseModel):
    member_id: str
    trainer_name: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class CheckOutRequest(BaseModel):
    attendance_id: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class AttendanceResponse(BaseModel):
    id: str
    member_id: str
    member_name: str
    photo_url: Optional[str] = None
    check_in_time: str
    check_out_time: Optional[str] = None
    trainer_name: Optional[str] = None
    date: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class AttendanceStats(BaseModel):
    checked_in_today: int
    total_monthly_check_ins: int
    active_now: int

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
