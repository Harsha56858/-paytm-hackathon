import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


# ==========================================
# CUSTOMER ENQUIRY MODEL
# ==========================================

class Enquiry(Base):
    __tablename__ = "enquiries"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    customer_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    phone_number: Mapped[str] = mapped_column(
        String(15),
        nullable=False,
        index=True
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    source: Mapped[str] = mapped_column(
        String(50),
        default="website"
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="new"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


# ==========================================
# CALLBACK REQUEST MODEL
# ==========================================

class CallbackRequest(Base):
    __tablename__ = "callback_requests"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    customer_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    phone_number: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    preferred_time: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="pending_review"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None
    )

    follow_up_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default=None
    )

    updated_by: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        default=None
    )
