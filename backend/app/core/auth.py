import os
import secrets
from typing import Optional
from fastapi import Header, HTTPException, status
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env", override=True)

def verify_admin_token(
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> dict:
    expected_token = os.getenv("ADMIN_API_KEY")

    if not expected_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_API_KEY is not configured on the server."
        )

    provided_token = None

    if x_admin_token:
        provided_token = x_admin_token.strip()
    elif authorization:
        parts = authorization.strip().split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            provided_token = parts[1].strip()
        elif len(parts) == 1:
            provided_token = parts[0].strip()

    if not provided_token or not secrets.compare_digest(provided_token, expected_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing administrator credentials."
        )

    return {
        "username": "Workspace Admin",
        "role": "administrator"
    }
