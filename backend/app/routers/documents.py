from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    Form,
    HTTPException,
)

from ..dependencies import current_user
from ..supabase_client import supabase
from ..services.file_service import sha256_bytes
from ..services.audit_service import audit


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

BUCKET = "case-documents"


# ============================================================
# ALLOWED DOCUMENT CATEGORIES
# ============================================================

ALLOWED_CATEGORIES = {
    "FIR",
    "Witness Statements",
    "Evidence Documents",
    "Investigation Documents",
    "Court Documents",
    "Forensic Reports",
    "Other Documents",
}


# ============================================================
# GET ALL DOCUMENTS OF A CASE
# ============================================================

@router.get("/case/{case_id}")
def case_documents(
    case_id: str,
    user=Depends(current_user)
):
    try:
        result = (
            supabase
            .table("documents")
            .select("*")
            .eq("case_id", case_id)
            .order("uploaded_at", desc=True)
            .execute()
        )

        return result.data or []

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load documents: {exc}"
        )


# ============================================================
# UPLOAD DOCUMENT
# ============================================================

@router.post("/case/{case_id}/upload")
async def upload_document(
    case_id: str,

    # Actual uploaded file
    file: UploadFile = File(...),

    # Category sent from frontend
    category: str = Form("Other Documents"),

    user=Depends(current_user)
):

    # --------------------------------------------------------
    # Validate category
    # --------------------------------------------------------

    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid document category: {category}. "
                f"Allowed categories: "
                f"{', '.join(sorted(ALLOWED_CATEGORIES))}"
            )
        )

    # --------------------------------------------------------
    # Read uploaded file
    # --------------------------------------------------------

    data = await file.read()

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    # --------------------------------------------------------
    # Generate SHA-256 hash
    # --------------------------------------------------------

    digest = sha256_bytes(data)

    # --------------------------------------------------------
    # Make filename safe
    # --------------------------------------------------------

    original_name = file.filename or "document"

    safe_name = (
        original_name
        .replace("/", "_")
        .replace("\\", "_")
    )

    # --------------------------------------------------------
    # Storage path
    # --------------------------------------------------------

    path = f"{case_id}/{digest}_{safe_name}"

    # --------------------------------------------------------
    # Upload file to Supabase Storage
    # --------------------------------------------------------

    try:
        supabase.storage.from_(BUCKET).upload(
            path,
            data,
            {
                "content-type": (
                    file.content_type
                    or "application/octet-stream"
                ),
                "upsert": "false"
            }
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Storage upload failed: {exc}"
        )

    # --------------------------------------------------------
    # Save document metadata
    # --------------------------------------------------------

    payload = {
        "case_id": case_id,

        "document_name": original_name,

        "original_filename": original_name,

        # IMPORTANT:
        # Use category received from frontend
        "category": category,

        "document_type": (
            file.content_type
            or "application/octet-stream"
        ),

        "storage_path": path,

        "mime_type": (
            file.content_type
            or "application/octet-stream"
        ),

        "file_size": len(data),

        # Integrity hash
        "sha256_hash": digest,

        "encryption_status": "Pending",

        "verification_status": "Verified",

        "uploaded_by": user["id"],
    }

    # --------------------------------------------------------
    # Insert document metadata
    # --------------------------------------------------------

    try:
        result = (
            supabase
            .table("documents")
            .insert(payload)
            .execute()
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Document database insert failed: "
                f"{exc}"
            )
        )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail=(
                "Document was uploaded but "
                "metadata was not created"
            )
        )

    document = result.data[0]

    # --------------------------------------------------------
    # Create first document version
    # --------------------------------------------------------

    try:
        (
            supabase
            .table("document_versions")
            .insert(
                {
                    "document_id": document["id"],
                    "version_number": 1,
                    "storage_path": path,
                    "sha256_hash": digest,
                    "uploaded_by": user["id"],
                    "change_description": (
                        "Initial upload"
                    )
                }
            )
            .execute()
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Document version creation failed: "
                f"{exc}"
            )
        )

    # --------------------------------------------------------
    # Audit log
    # --------------------------------------------------------

    try:
        audit(
            user["id"],
            "Uploaded document",
            case_id=case_id,
            document_id=document["id"],
            details={
                "sha256": digest,
                "category": category,
                "filename": original_name,
            }
        )

    except Exception as exc:
        # Audit failure should not fail successful upload
        print(
            f"Audit log warning: {exc}"
        )

    # --------------------------------------------------------
    # Return document
    # --------------------------------------------------------

    return document


# ============================================================
# VIEW / OPEN DOCUMENT
# ============================================================

@router.get("/{document_id}/view")
def view_document(
    document_id: str,
    user=Depends(current_user)
):

    # --------------------------------------------------------
    # Find document
    # --------------------------------------------------------

    try:
        result = (
            supabase
            .table("documents")
            .select("*")
            .eq("id", document_id)
            .single()
            .execute()
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Unable to find document: {exc}"
            )
        )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    document = result.data

    storage_path = document.get("storage_path")

    if not storage_path:
        raise HTTPException(
            status_code=400,
            detail=(
                "Document storage path is missing"
            )
        )

    # --------------------------------------------------------
    # Generate temporary signed URL
    # --------------------------------------------------------

    try:

        signed = (
            supabase
            .storage
            .from_(BUCKET)
            .create_signed_url(
                storage_path,
                3600
            )
        )

        signed_url = (
            signed.get("signedURL")
            or signed.get("signedUrl")
        )

        if not signed_url:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Signed URL was not generated"
                )
            )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate document URL: "
                f"{exc}"
            )
        )

    # --------------------------------------------------------
    # Return document information
    # --------------------------------------------------------

    return {
        "id": document.get("id"),

        "document_name": (
            document.get("document_name")
            or document.get("original_filename")
            or "Document"
        ),

        "original_filename": (
            document.get("original_filename")
        ),

        "category": (
            document.get("category")
            or "Other Documents"
        ),

        "mime_type": (
            document.get("mime_type")
            or document.get("document_type")
            or "application/octet-stream"
        ),

        "file_size": (
            document.get("file_size")
        ),

        "sha256_hash": (
            document.get("sha256_hash")
        ),

        "storage_path": storage_path,

        # Temporary URL valid for 1 hour
        "url": signed_url,
    }