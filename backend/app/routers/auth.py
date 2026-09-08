from datetime import datetime, timedelta, timezone

from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from ..supabase_client import supabase
from ..security import (
    generate_otp,
    hash_otp,
    create_access_token,
)
from ..services.email_service import send_otp_email
from ..config import settings


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# LOGIN MODEL
# ============================================================

class LoginRequest(BaseModel):
    role: str
    government_id: str
    mobile: str


# ============================================================
# OTP MODEL
# ============================================================

class OTPVerifyRequest(BaseModel):
    user_id: str
    otp: str


# ============================================================
# ACCESS REQUEST MODEL
# ============================================================

class AccessRequest(BaseModel):
    full_name: str
    email: str
    mobile: str
    government_id: str
    department: str
    requested_role: str
    reason: str


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(data: LoginRequest):

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------
    
    result = (
        supabase
        .table("users")
        .select("*")
        .eq("government_id", data.government_id)
        .eq("mobile", data.mobile)
        .eq("role", data.role)
        .execute()
    )

    user = result.data[0] if result.data else None

    # --------------------------------------------------------
    # USER NOT FOUND
    # --------------------------------------------------------

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Government ID, mobile number or role is incorrect."
        )

    # --------------------------------------------------------
    # ADMIN APPROVAL CHECK
    # --------------------------------------------------------

    status = user.get("status")

    if status != "Active":

        if status == "Pending":

            raise HTTPException(
                status_code=403,
                detail=(
                    "Your access request is still pending. "
                    "Please wait for Administrator approval."
                )
            )

        elif status == "Rejected":

            raise HTTPException(
                status_code=403,
                detail=(
                    "Your access request has been rejected "
                    "by the Administrator."
                )
            )

        else:

            raise HTTPException(
                status_code=403,
                detail=(
                    f"Account status: {status}. "
                    "Login is not allowed."
                )
            )

    # --------------------------------------------------------
    # GENERATE OTP
    # --------------------------------------------------------

    otp = generate_otp()

    now = datetime.now(timezone.utc)

    payload = {
        "user_id": user["id"],
        "otp_hash": hash_otp(otp),
        "expires_at": (
            now + timedelta(minutes=10)
        ).isoformat(),
        "attempts": 0,
    }

    otp_result = (
        supabase
        .table("otp_verifications")
        .insert(payload)
        .execute()
    )

    if not otp_result.data:

        raise HTTPException(
            status_code=500,
            detail="Failed to generate OTP."
        )

    # --------------------------------------------------------
    # SEND OTP
    # --------------------------------------------------------

    try:

        send_otp_email(
            user["email"],
            otp
        )

    except Exception as error:

        print(
            "OTP email error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to send OTP."
        )

    # --------------------------------------------------------
    # LOGIN RESPONSE
    # --------------------------------------------------------

    response = {
        "message": "OTP sent successfully.",
        "expires_in": 600,
        "user_id": user["id"],
        "email": user["email"],
    }

    # --------------------------------------------------------
    # DEVELOPMENT MODE
    # --------------------------------------------------------

    if settings.dev_return_otp:
        response["otp"] = otp

    return response


# ============================================================
# VERIFY OTP
# ============================================================

@router.post("/verify-otp")
def verify_otp(
    data: OTPVerifyRequest
):

    # --------------------------------------------------------
    # GET LATEST OTP
    # --------------------------------------------------------

    result = (
        supabase
        .table("otp_verifications")
        .select("*")
        .eq("user_id", data.user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    row = (
        result.data[0]
        if result.data
        else None
    )

    if not row:

        raise HTTPException(
            status_code=400,
            detail="OTP not found."
        )

    # --------------------------------------------------------
    # CHECK OTP ALREADY USED
    # --------------------------------------------------------

    if row.get("verified_at"):

        raise HTTPException(
            status_code=400,
            detail="OTP already used."
        )

    # --------------------------------------------------------
    # CHECK OTP EXPIRY
    # --------------------------------------------------------

    expires_at = datetime.fromisoformat(
        row["expires_at"].replace(
            "Z",
            "+00:00"
        )
    )

    if expires_at < datetime.now(timezone.utc):

        raise HTTPException(
            status_code=400,
            detail="OTP expired."
        )

    # --------------------------------------------------------
    # CHECK ATTEMPT LIMIT
    # --------------------------------------------------------

    if row.get("attempts", 0) >= 5:

        raise HTTPException(
            status_code=429,
            detail="Too many OTP attempts."
        )

    # --------------------------------------------------------
    # VERIFY OTP
    # --------------------------------------------------------

    if hash_otp(data.otp) != row["otp_hash"]:

        new_attempts = (
            row.get("attempts", 0) + 1
        )

        (
            supabase
            .table("otp_verifications")
            .update({
                "attempts": new_attempts
            })
            .eq("id", row["id"])
            .execute()
        )

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    # --------------------------------------------------------
    # MARK OTP VERIFIED
    # --------------------------------------------------------

    (
        supabase
        .table("otp_verifications")
        .update({
            "verified_at": (
                datetime.now(
                    timezone.utc
                ).isoformat()
            )
        })
        .eq("id", row["id"])
        .execute()
    )

    # --------------------------------------------------------
    # GET USER
    # --------------------------------------------------------

    user_result = (
        supabase
        .table("users")
        .select("*")
        .eq("id", data.user_id)
        .single()
        .execute()
    )

    user = user_result.data

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # --------------------------------------------------------
    # SECURITY CHECK
    # --------------------------------------------------------

    if user.get("status") != "Active":

        raise HTTPException(
            status_code=403,
            detail=(
                "Account is not active. "
                "Administrator approval is required."
            )
        )

    # --------------------------------------------------------
    # CREATE ACCESS TOKEN
    # --------------------------------------------------------

    access_token = create_access_token(
        user
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


# ============================================================
# ACCESS REQUEST
# ============================================================

@router.post("/access-request")
def access_request(
    data: AccessRequest
):

    # --------------------------------------------------------
    # ALLOWED ROLES
    # --------------------------------------------------------

    allowed_roles = [
        "Forensic Officer",
        "Legal Officer",
        "Court Authority",
        "Administrator",
    ]

    if data.requested_role not in allowed_roles:

        raise HTTPException(
            status_code=400,
            detail="Invalid requested role."
        )

    # --------------------------------------------------------
    # CHECK EXISTING USER
    # --------------------------------------------------------

    try:

        existing_user = (
            supabase
            .table("users")
            .select(
                "id, status, role, government_id"
            )
            .eq(
                "government_id",
                data.government_id
            )
            .maybe_single()
            .execute()
        )

    except Exception as error:

        print(
            "Existing user check error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(error)}"
        )

    if existing_user.data:

        existing = existing_user.data

        # ----------------------------------------------------
        # ACTIVE ACCOUNT
        # ----------------------------------------------------

        if existing.get("status") == "Active":

            raise HTTPException(
                status_code=409,
                detail=(
                    "An active account already exists "
                    "for this Government ID."
                )
            )

    # --------------------------------------------------------
    # CHECK DUPLICATE PENDING REQUEST
    # --------------------------------------------------------

    try:

        pending_request = (
            supabase
            .table("access_requests")
            .select(
                "id, status, requested_role"
            )
            .eq(
                "government_id",
                data.government_id
            )
            .eq(
                "status",
                "Pending"
            )
            .maybe_single()
            .execute()
        )

    except Exception as error:

        print(
            "Pending request check error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(error)}"
        )

    if pending_request.data:

        raise HTTPException(
            status_code=409,
            detail=(
                "An access request for this "
                "Government ID is already pending."
            )
        )

    # ========================================================
    # CREATE ACCESS REQUEST
    # ========================================================

    payload = {
        "full_name": data.full_name,
        "email": data.email,
        "mobile": data.mobile,
        "government_id": data.government_id,
        "department": data.department,
        "requested_role": data.requested_role,
        "reason": data.reason,
        "status": "Pending",
    }

    # --------------------------------------------------------
    # INSERT INTO SUPABASE
    # --------------------------------------------------------

    try:

        result = (
            supabase
            .table("access_requests")
            .insert(payload)
            .execute()
        )

    except Exception as error:

        print(
            "ACCESS REQUEST INSERT ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to submit access request: "
                f"{str(error)}"
            )
        )

    # --------------------------------------------------------
    # CHECK INSERT RESULT
    # --------------------------------------------------------

    if not result.data:

        raise HTTPException(
            status_code=500,
            detail="Failed to submit access request."
        )

    # --------------------------------------------------------
    # SUCCESS RESPONSE
    # --------------------------------------------------------

    return {
        "message": (
            "Access request submitted successfully. "
            "Please wait for Administrator approval."
        ),
        "request": result.data[0],
    }