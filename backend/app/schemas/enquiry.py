from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from typing import Optional, List
from datetime import datetime


class EnquiryCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=15)
    email: Optional[EmailStr] = None
    message: str = Field(..., min_length=5, max_length=2000)
    source: str = "website"


class EnquiryResponse(BaseModel):
    success: bool
    message: str
    enquiry_id: str


class CallbackRequestCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=20)
    preferred_time: str = Field(..., min_length=2, max_length=100)
    reason: Optional[str] = Field(default=None, max_length=1000)


class CallbackRequestResponse(BaseModel):
    success: bool
    message: str
    callback_id: str


VALID_CALLBACK_STATUSES = {"pending_review", "contacted", "completed", "cancelled"}


class CallbackRequestUpdate(BaseModel):
    status: Optional[str] = None
    follow_up_notes: Optional[str] = Field(None, max_length=5000)
    updated_by: Optional[str] = Field(None, max_length=100)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean_status = v.strip().lower()
            if clean_status not in VALID_CALLBACK_STATUSES:
                raise ValueError(
                    f"Invalid status '{v}'. Allowed values are: {', '.join(sorted(VALID_CALLBACK_STATUSES))}"
                )
            return clean_status
        return v

    @field_validator("follow_up_notes")
    @classmethod
    def validate_follow_up_notes(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if len(cleaned) == 0:
                raise ValueError("Follow-up notes cannot be empty or only whitespace")
            return cleaned
        return v

    @model_validator(mode="after")
    def validate_at_least_one_field(self):
        if self.status is None and self.follow_up_notes is None:
            raise ValueError("At least one of 'status' or 'follow_up_notes' must be provided for update")
        return self


class CallbackRequestItem(BaseModel):
    id: str
    customer_name: str
    phone_number: str
    preferred_time: str
    reason: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    follow_up_notes: Optional[str] = None
    updated_by: Optional[str] = None

    model_config = {"from_attributes": True}


class CallbackRequestUpdateResponse(BaseModel):
    success: bool
    message: str
    callback: CallbackRequestItem


class CallbackStatsResponse(BaseModel):
    total: int
    pending_review: int
    contacted: int
    completed: int
    cancelled: int


class TestCallRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=20)
    language: str = Field("English", description="Preferred language (English, Telugu, Hindi)")


class TestCallResponse(BaseModel):
    success: bool
    call_id: str
    customer_name: str
    phone_number: str
    language: str
    status: str
    message: str
    dispatched_at: str
