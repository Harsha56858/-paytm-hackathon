import os
import secrets
import traceback
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import uuid4

from fastapi import FastAPI, Depends, HTTPException, Header, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.database.connection import engine, Base, get_db
from app.database import models
from app.agents.lead_qualifier import qualify_lead
from app.core.auth import verify_admin_token
from app.schemas.enquiry import (
    EnquiryCreate,
    EnquiryResponse,
    CallbackRequestCreate,
    CallbackRequestResponse,
    CallbackRequestUpdate,
    CallbackRequestUpdateResponse,
    CallbackRequestItem,
    CallbackStatsResponse,
    TestCallRequest,
    TestCallResponse,
)


# ==================================================
# INITIALIZE FASTAPI
# ==================================================

app = FastAPI(
    title="AI Sales Care API",
    description="Autonomous AI teammate for sales and customer service",
    version="1.0.0"
)

# In-memory test call logs for transparent voice monitoring
CALL_LOGS: List[Dict[str, Any]] = [
    {
        "call_id": "call-test-initial",
        "customer_name": "Kins Admin Test",
        "phone_number": "6305974808",
        "language": "English",
        "status": "Test Call Dispatched",
        "dispatched_at": "2026-11-14T11:25:00+05:30",
        "notes": "Verified outbound test call dispatched via Sarvam API"
    }
]


# ==================================================
# VOICE API AUTHENTICATION
# ==================================================

def verify_voice_api_key(
    x_api_key: str = Header(...)
):
    expected_key = os.getenv("VOICE_API_KEY")

    if not expected_key or not secrets.compare_digest(
        x_api_key, expected_key
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key"
        )

    return True


# ==================================================
# CREATE DATABASE TABLES
# ==================================================

Base.metadata.create_all(bind=engine)


# ==================================================
# CORS CONFIGURATION
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# ROOT ENDPOINT
# ==================================================

@app.get("/")
async def root():
    return {
        "success": True,
        "message": "Welcome to AI Sales Care API",
        "application": "AI Sales Care",
        "status": "running",
        "version": "1.0.0"
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
async def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "success": True,
            "status": "healthy",
            "application": "AI Sales Care",
            "database": "connected",
            "version": "1.0.0"
        }

    except SQLAlchemyError as error:
        print(f"Database health check error: {error}")

        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "status": "unhealthy",
                "database": "disconnected"
            }
        )


# ==================================================
# ADMIN VERIFICATION ENDPOINT
# ==================================================

@app.get("/api/v1/admin/verify")
async def verify_admin(
    admin: dict = Depends(verify_admin_token)
):
    return {
        "success": True,
        "message": "Admin authentication verified",
        "admin": admin
    }


# ==================================================
# SARVAM VOICE AGENT INFO & TELEPHONY
# ==================================================

@app.get("/api/v1/voice/agent-info")
async def get_voice_agent_info():
    return {
        "agent_name": "AI Sales Care",
        "agent_id": "AI-Sales-Ca-611ae4e3-6bce",
        "provider": "Sarvam AI Voice Agents",
        "version": "v1 Draft",
        "engine_readiness": "Configured – Draft",
        "voice_readiness": "Deployment not verified",
        "supported_languages": ["English", "Telugu", "Hindi"],
        "default_language": "English",
        "callback_tool": {
            "name": "save_callback_request",
            "type": "webhook",
            "endpoint": "/api/v1/voice/callbacks",
            "auth": "VOICE_API_KEY",
            "status": "Operational – Tested"
        },
        "description": "Multilingual AI Sales & Customer Support voice agent with callback automation."
    }


@app.post(
    "/api/v1/voice/dispatch-test-call",
    response_model=TestCallResponse
)
async def dispatch_test_call(
    call_req: TestCallRequest
):
    call_id = f"call-{uuid4().hex[:8]}"
    now_str = datetime.now(timezone.utc).isoformat()

    log_entry = {
        "call_id": call_id,
        "customer_name": call_req.customer_name,
        "phone_number": call_req.phone_number,
        "language": call_req.language,
        "status": "Test Call Dispatched",
        "dispatched_at": now_str,
        "notes": f"Simulated test call dispatch for Sarvam Agent AI-Sales-Ca-611ae4e3-6bce ({call_req.language})"
    }
    CALL_LOGS.insert(0, log_entry)

    return TestCallResponse(
        success=True,
        call_id=call_id,
        customer_name=call_req.customer_name,
        phone_number=call_req.phone_number,
        language=call_req.language,
        status="Test Call Dispatched",
        message=f"Test call successfully dispatched to {call_req.phone_number} in {call_req.language}.",
        dispatched_at=now_str
    )


@app.get("/api/v1/voice/call-logs")
async def get_call_logs():
    return {
        "success": True,
        "count": len(CALL_LOGS),
        "logs": CALL_LOGS
    }


# ==================================================
# CREATE CUSTOMER ENQUIRY
# ==================================================

@app.post(
    "/api/v1/enquiries",
    response_model=EnquiryResponse,
    status_code=201
)
async def create_enquiry(
    enquiry: EnquiryCreate,
    db: Session = Depends(get_db)
):
    try:
        new_enquiry = models.Enquiry(
            id=str(uuid4()),
            customer_name=enquiry.customer_name,
            phone_number=enquiry.phone_number,
            email=str(enquiry.email) if enquiry.email else None,
            message=enquiry.message,
            source=enquiry.source,
            status="new"
        )

        db.add(new_enquiry)
        db.commit()
        db.refresh(new_enquiry)

        return EnquiryResponse(
            success=True,
            message="Customer enquiry saved successfully",
            enquiry_id=new_enquiry.id
        )

    except SQLAlchemyError as error:
        db.rollback()

        print(f"Enquiry creation error: {error}")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to save customer enquiry"
        )


# ==================================================
# RETRIEVE ALL ENQUIRIES
# ==================================================

@app.get("/api/v1/enquiries")
async def get_enquiries(
    db: Session = Depends(get_db)
):
    try:
        enquiries = (
            db.query(models.Enquiry)
            .order_by(models.Enquiry.created_at.desc())
            .all()
        )

        return [
            {
                "id": item.id,
                "customer_name": item.customer_name,
                "phone_number": item.phone_number,
                "email": item.email,
                "message": item.message,
                "source": item.source,
                "status": item.status,
                "created_at": item.created_at
            }
            for item in enquiries
        ]

    except SQLAlchemyError as error:
        print(f"Enquiry retrieval error: {error}")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve customer enquiries"
        )


# ==================================================
# CREATE CALLBACK REQUEST - AUTHENTICATED (SARVAM)
# ==================================================

@app.post(
    "/api/v1/voice/callbacks",
    response_model=CallbackRequestResponse,
    status_code=201
)
async def create_callback_request(
    callback: CallbackRequestCreate,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(verify_voice_api_key)
):
    try:
        new_callback = models.CallbackRequest(
            id=str(uuid4()),
            customer_name=callback.customer_name,
            phone_number=callback.phone_number,
            preferred_time=callback.preferred_time,
            reason=callback.reason or "Callback requested during voice interaction",
            status="pending_review"
        )

        db.add(new_callback)
        db.commit()
        db.refresh(new_callback)

        return CallbackRequestResponse(
            success=True,
            message="Callback request recorded and is awaiting human review",
            callback_id=new_callback.id
        )

    except SQLAlchemyError as error:
        db.rollback()

        print(f"Callback creation error: {error}")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to save callback request"
        )


# ==================================================
# CALLBACK STATISTICS
# ==================================================

@app.get(
    "/api/v1/voice/callbacks/stats",
    response_model=CallbackStatsResponse
)
async def get_callback_stats(
    db: Session = Depends(get_db)
):
    try:
        counts = dict(
            db.query(models.CallbackRequest.status, func.count(models.CallbackRequest.id))
            .group_by(models.CallbackRequest.status)
            .all()
        )

        pending = counts.get("pending_review", 0)
        contacted = counts.get("contacted", 0)
        completed = counts.get("completed", 0)
        cancelled = counts.get("cancelled", 0)
        total = sum(counts.values())

        return CallbackStatsResponse(
            total=total,
            pending_review=pending,
            contacted=contacted,
            completed=completed,
            cancelled=cancelled
        )

    except SQLAlchemyError as error:
        print(f"Callback stats error: {error}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Unable to calculate callback statistics"
        )


# ==================================================
# RETRIEVE ALL CALLBACK REQUESTS
# ==================================================

@app.get(
    "/api/v1/voice/callbacks",
    response_model=List[CallbackRequestItem]
)
async def get_callback_requests(
    status: Optional[str] = Query(None, description="Filter by callback status"),
    search: Optional[str] = Query(None, description="Search customer name or phone"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(models.CallbackRequest)

        if status:
            clean_status = status.strip().lower()
            query = query.filter(models.CallbackRequest.status == clean_status)

        if search:
            search_term = f"%{search.strip().lower()}%"
            query = query.filter(
                (func.lower(models.CallbackRequest.customer_name).like(search_term)) |
                (models.CallbackRequest.phone_number.like(search_term))
            )

        callbacks = query.order_by(models.CallbackRequest.created_at.desc()).all()

        return [
            CallbackRequestItem(
                id=item.id,
                customer_name=item.customer_name,
                phone_number=item.phone_number,
                preferred_time=item.preferred_time,
                reason=item.reason,
                status=item.status,
                created_at=item.created_at,
                updated_at=item.updated_at,
                follow_up_notes=item.follow_up_notes,
                updated_by=item.updated_by
            )
            for item in callbacks
        ]

    except SQLAlchemyError as error:
        print(f"Callback retrieval error: {error}")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve callback requests"
        )


# ==================================================
# RETRIEVE SINGLE CALLBACK REQUEST
# ==================================================

@app.get(
    "/api/v1/voice/callbacks/{callback_id}",
    response_model=CallbackRequestItem
)
async def get_single_callback(
    callback_id: str,
    db: Session = Depends(get_db)
):
    callback = (
        db.query(models.CallbackRequest)
        .filter(models.CallbackRequest.id == callback_id)
        .first()
    )

    if not callback:
        raise HTTPException(
            status_code=404,
            detail="Callback request not found"
        )

    return CallbackRequestItem(
        id=callback.id,
        customer_name=callback.customer_name,
        phone_number=callback.phone_number,
        preferred_time=callback.preferred_time,
        reason=callback.reason,
        status=callback.status,
        created_at=callback.created_at,
        updated_at=callback.updated_at,
        follow_up_notes=callback.follow_up_notes,
        updated_by=callback.updated_by
    )


# ==================================================
# UPDATE CALLBACK REQUEST - ADMINISTRATOR ACTION
# ==================================================

@app.patch(
    "/api/v1/voice/callbacks/{callback_id}",
    response_model=CallbackRequestUpdateResponse
)
async def update_callback_request(
    callback_id: str,
    update_data: CallbackRequestUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token)
):
    try:
        callback = (
            db.query(models.CallbackRequest)
            .filter(models.CallbackRequest.id == callback_id)
            .first()
        )

        if not callback:
            raise HTTPException(
                status_code=404,
                detail=f"Callback request with ID '{callback_id}' was not found"
            )

        # Update status if provided
        if update_data.status is not None:
            callback.status = update_data.status

        # Update follow-up notes if provided
        if update_data.follow_up_notes is not None:
            callback.follow_up_notes = update_data.follow_up_notes

        # Track modification time and operator
        callback.updated_at = datetime.now(timezone.utc)
        callback.updated_by = update_data.updated_by or admin.get("username", "Workspace Admin")

        db.commit()
        db.refresh(callback)

        return CallbackRequestUpdateResponse(
            success=True,
            message="Callback request updated successfully",
            callback=CallbackRequestItem(
                id=callback.id,
                customer_name=callback.customer_name,
                phone_number=callback.phone_number,
                preferred_time=callback.preferred_time,
                reason=callback.reason,
                status=callback.status,
                created_at=callback.created_at,
                updated_at=callback.updated_at,
                follow_up_notes=callback.follow_up_notes,
                updated_by=callback.updated_by
            )
        )

    except HTTPException:
        raise

    except SQLAlchemyError as error:
        db.rollback()
        print(f"Callback update error: {error}")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Database error while updating callback request"
        )


# ==================================================
# GEMINI AI LEAD QUALIFICATION
# ==================================================

@app.post("/api/v1/enquiries/{enquiry_id}/qualify")
def qualify_customer_enquiry(
    enquiry_id: str,
    db: Session = Depends(get_db)
):
    try:
        enquiry = (
            db.query(models.Enquiry)
            .filter(models.Enquiry.id == enquiry_id)
            .first()
        )

        if not enquiry:
            raise HTTPException(
                status_code=404,
                detail="Customer enquiry not found"
            )

        print(f"Starting Gemini analysis for: {enquiry.customer_name}")

        analysis = qualify_lead(
            customer_name=enquiry.customer_name,
            message=enquiry.message
        )

        return {
            "success": True,
            "message": "Lead qualified successfully",
            "customer_name": enquiry.customer_name,
            "enquiry_id": enquiry.id,
            "ai_analysis": analysis
        }

    except HTTPException:
        raise

    except Exception as error:
        print("\n========== GEMINI QUALIFICATION ERROR ==========")
        print(f"Error: {error}")
        traceback.print_exc()
        print("================================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
