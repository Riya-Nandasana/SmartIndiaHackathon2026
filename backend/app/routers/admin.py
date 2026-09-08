from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..dependencies import require_roles
from ..supabase_client import supabase
from ..services.audit_service import audit


router = APIRouter(
    prefix="/admin",
    tags=["Administration"]
)


# ============================================================
# GET ACCESS REQUESTS
# ============================================================

@router.get("/access-requests")
def get_access_requests(
    admin=Depends(
        require_roles("Administrator")
    )
):

    result = (
        supabase
        .table("access_requests")
        .select("*")
        .order(
            "created_at",
            desc=True
        )
        .execute()
    )

    return result.data or []


# ============================================================
# DECISION MODEL
# ============================================================

class Decision(BaseModel):
    action: str
    rejection_reason: str | None = None


# ============================================================
# APPROVE / REJECT ACCESS REQUEST
# ============================================================

@router.patch("/access-requests/{request_id}")
def decide_access_request(
    request_id: str,
    data: Decision,
    admin=Depends(
        require_roles("Administrator")
    )
):

    # --------------------------------------------------------
    # VALIDATE ACTION
    # --------------------------------------------------------

    if data.action not in {
        "Approved",
        "Rejected"
    }:

        raise HTTPException(
            status_code=400,
            detail=(
                "Action must be "
                "Approved or Rejected."
            )
        )

    # --------------------------------------------------------
    # GET REQUEST
    # --------------------------------------------------------

    request_result = (
        supabase
        .table("access_requests")
        .select("*")
        .eq(
            "id",
            request_id
        )
        .maybe_single()
        .execute()
    )

    request_data = request_result.data

    if not request_data:

        raise HTTPException(
            status_code=404,
            detail="Access request not found."
        )

    # --------------------------------------------------------
    # PREVENT RE-PROCESSING
    # --------------------------------------------------------

    current_status = request_data.get(
        "status"
    )

    if current_status in {
        "Approved",
        "Rejected"
    }:

        raise HTTPException(
            status_code=400,
            detail=(
                f"This request has already been "
                f"{current_status.lower()}."
            )
        )

    # --------------------------------------------------------
    # UPDATE ACCESS REQUEST
    # --------------------------------------------------------

    update_data = {
        "status": data.action,
        "reviewed_by": admin["id"],
        "rejection_reason": (
            data.rejection_reason
            if data.action == "Rejected"
            else None
        ),
    }

    update_result = (
        supabase
        .table("access_requests")
        .update(update_data)
        .eq(
            "id",
            request_id
        )
        .execute()
    )

    # --------------------------------------------------------
    # APPROVED
    # --------------------------------------------------------

    if data.action == "Approved":

        # -----------------------------------------------
        # CHECK WHETHER USER ALREADY EXISTS
        # -----------------------------------------------

        existing_result = (
            supabase
            .table("users")
            .select(
                "id, email, government_id, status"
            )
            .eq(
                "email",
                request_data["email"]
            )
            .maybe_single()
            .execute()
        )

        existing_user = existing_result.data

        # -----------------------------------------------
        # CREATE USER
        # -----------------------------------------------

        if not existing_user:

            user_payload = {
                "full_name":
                    request_data["full_name"],

                "email":
                    request_data["email"],

                "mobile":
                    request_data.get("mobile"),

                "government_id":
                    request_data.get(
                        "government_id"
                    ),

                "department":
                    request_data.get(
                        "department"
                    ),

                "role":
                    request_data[
                        "requested_role"
                    ],

                "status":
                    "Active",
            }

            user_result = (
                supabase
                .table("users")
                .insert(user_payload)
                .execute()
            )

            if not user_result.data:

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Request approved, "
                        "but user account could "
                        "not be created."
                    )
                )

        # -----------------------------------------------
        # EXISTING USER
        # -----------------------------------------------

        else:

            if existing_user.get(
                "status"
            ) != "Active":

                (
                    supabase
                    .table("users")
                    .update({
                        "status": "Active",
                        "role":
                            request_data[
                                "requested_role"
                            ],
                        "department":
                            request_data.get(
                                "department"
                            ),
                        "mobile":
                            request_data.get(
                                "mobile"
                            ),
                        "government_id":
                            request_data.get(
                                "government_id"
                            ),
                        "full_name":
                            request_data[
                                "full_name"
                            ],
                    })
                    .eq(
                        "id",
                        existing_user["id"]
                    )
                    .execute()
                )

    # --------------------------------------------------------
    # AUDIT
    # --------------------------------------------------------

    audit(
        admin["id"],
        (
            f"{data.action} access request"
        ),
        details={
            "request_id": request_id,
            "requested_role":
                request_data.get(
                    "requested_role"
                ),
            "email":
                request_data.get(
                    "email"
                ),
        }
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "message":
            (
                "Request approved successfully."
                if data.action == "Approved"
                else
                "Request rejected successfully."
            ),

        "request_id":
            request_id,

        "status":
            data.action,
    }