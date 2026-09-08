from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..dependencies import current_user
from ..supabase_client import supabase
from ..services.audit_service import audit


router = APIRouter(
    prefix="/cases",
    tags=["Cases"]
)


# ============================================================
# CREATE CASE MODEL
# ============================================================

class CaseCreate(BaseModel):
    case_number: str
    title: str
    category: str | None = None
    description: str | None = None
    priority: str = "Medium"


# ============================================================
# FORENSIC ASSIGNMENT MODEL
# ============================================================

class ForensicAssignment(BaseModel):
    forensic_officer_id: str


# ============================================================
# LIST CASES
# ============================================================

@router.get("")
def list_cases(
    user=Depends(current_user)
):

    query = (
        supabase
        .table("cases")
        .select(
            "*, "
            "forensic_officer:users!cases_assigned_forensic_officer_fkey("
            "id, full_name, email, mobile, department, role, status"
            "), "
            "legal_officer:users!cases_assigned_legal_officer_fkey("
            "id, full_name, email, mobile, department, role, status"
            ")"
        )
    )

    # ========================================================
    # FORENSIC OFFICER
    # ========================================================
    # A forensic officer can ONLY see cases assigned to
    # their own user ID.
    # ========================================================

    if user.get("role") == "Forensic Officer":

        query = query.eq(
            "assigned_forensic_officer",
            user["id"]
        )

    result = (
        query
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


# ============================================================
# CREATE CASE
# ============================================================

@router.post("")
def create_case(
    data: CaseCreate,
    user=Depends(current_user)
):

    # Only Legal Officer / Administrator can create cases

    if user.get("role") not in [
        "Legal Officer",
        "Administrator"
    ]:
        raise HTTPException(
            status_code=403,
            detail=(
                "Only Legal Officer or Administrator "
                "can create a case."
            )
        )

    payload = data.model_dump()

    payload["created_by"] = user["id"]

    result = (
        supabase
        .table("cases")
        .insert(payload)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to create case."
        )

    case = result.data[0]

    audit(
        user["id"],
        "Created case",
        case_id=case["id"]
    )

    return case


# ============================================================
# GET SINGLE CASE
# ============================================================

@router.get("/{case_id}")
def get_case(
    case_id: str,
    user=Depends(current_user)
):

    result = (
        supabase
        .table("cases")
        .select(
            "*, "
            "forensic_officer:users!cases_assigned_forensic_officer_fkey("
            "id, full_name, email, mobile, department, role, status"
            "), "
            "legal_officer:users!cases_assigned_legal_officer_fkey("
            "id, full_name, email, mobile, department, role, status"
            ")"
        )
        .eq("id", case_id)
        .maybe_single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Case not found."
        )

    case = result.data

    # ========================================================
    # FORENSIC SECURITY
    # ========================================================
    # Forensic Officer can ONLY open assigned cases.
    # ========================================================

    if user.get("role") == "Forensic Officer":

        assigned_officer_id = case.get(
            "assigned_forensic_officer"
        )

        if (
            not assigned_officer_id
            or str(assigned_officer_id)
            != str(user["id"])
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not assigned to this case."
                )
            )

    return case


# ============================================================
# ASSIGN / REASSIGN FORENSIC OFFICER
# ============================================================

@router.patch("/{case_id}/assign-forensic")
def assign_forensic_officer(
    case_id: str,
    data: ForensicAssignment,
    user=Depends(current_user)
):

    # ========================================================
    # ADMINISTRATOR CHECK
    # ========================================================

    if user.get("role") != "Administrator":
        raise HTTPException(
            status_code=403,
            detail=(
                "Only Administrator can assign "
                "a Forensic Officer."
            )
        )

    # ========================================================
    # OFFICER ID CHECK
    # ========================================================

    if not data.forensic_officer_id:
        raise HTTPException(
            status_code=400,
            detail="Forensic Officer ID is required."
        )

    # ========================================================
    # CHECK CASE
    # ========================================================

    case_result = (
        supabase
        .table("cases")
        .select(
            "id, case_number, title, "
            "assigned_forensic_officer"
        )
        .eq("id", case_id)
        .maybe_single()
        .execute()
    )

    if not case_result.data:
        raise HTTPException(
            status_code=404,
            detail="Case not found."
        )

    case = case_result.data

    # ========================================================
    # CHECK FORENSIC OFFICER
    # ========================================================

    officer_result = (
        supabase
        .table("users")
        .select(
            "id, full_name, email, mobile, "
            "department, role, status"
        )
        .eq("id", data.forensic_officer_id)
        .maybe_single()
        .execute()
    )

    if not officer_result.data:
        raise HTTPException(
            status_code=404,
            detail="Forensic Officer not found."
        )

    officer = officer_result.data

    # ========================================================
    # ROLE VALIDATION
    # ========================================================

    officer_role = str(
        officer.get("role") or ""
    ).strip().lower()

    if officer_role != "forensic officer":
        raise HTTPException(
            status_code=400,
            detail=(
                "Selected user is not a "
                "Forensic Officer."
            )
        )

    # ========================================================
    # ACTIVE USER CHECK
    # ========================================================

    officer_status = str(
        officer.get("status") or ""
    ).strip().lower()

    if officer_status != "active":
        raise HTTPException(
            status_code=400,
            detail=(
                "Only an Active Forensic Officer "
                "can be assigned."
            )
        )

    # ========================================================
    # ASSIGN OFFICER TO CASE
    # ========================================================

    supabase.table("cases").update(
        {
            "assigned_forensic_officer": data.forensic_officer_id
        }
    ).eq("id", case_id).execute()

    updated_result = (
        supabase
        .table("cases")
        .select("*")
        .eq("id", case_id)
        .execute()
    )

    if not updated_result.data:
        raise HTTPException(
            status_code=500,
            detail="Case was updated but could not be retrieved."
        )

    updated_case = updated_result.data[0]
    # ========================================================
    # AUDIT LOG
    # ========================================================

    audit(
        user["id"],
        (
            "Assigned forensic officer: "
            f"{officer.get('full_name', 'Forensic Officer')}"
        ),
        case_id=case_id
    )

    # ========================================================
    # RETURN
    # ========================================================

    return {
        "message":
            "Forensic Officer assigned successfully.",

        "case":
            updated_case,

        "forensic_officer":
            officer
    }