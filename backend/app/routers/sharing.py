from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..dependencies import current_user
from ..supabase_client import supabase
from ..services.audit_service import audit

router = APIRouter(prefix="/sharing", tags=["Sharing"])

class ShareRequest(BaseModel):
    document_id: str
    shared_with: str
    permission: str = "View"
    expires_at: str | None = None

@router.post("")
def share(data: ShareRequest, user=Depends(current_user)):
    row = {"document_id": data.document_id, "shared_by": user["id"], "shared_with": data.shared_with, "permission": data.permission, "expires_at": data.expires_at}
    result = supabase.table("document_shares").insert(row).execute()
    audit(user["id"], "Shared document", document_id=data.document_id, details={"shared_with": data.shared_with, "permission": data.permission})
    return result.data[0]

@router.get("/{document_id}")
def shares(document_id: str, user=Depends(current_user)):
    return supabase.table("document_shares").select("*").eq("document_id", document_id).execute().data
