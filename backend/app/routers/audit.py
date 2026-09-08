from fastapi import APIRouter, Depends
from ..dependencies import current_user
from ..supabase_client import supabase

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("")
def audit_logs(user=Depends(current_user)):
    return supabase.table("audit_logs").select("*").order("created_at", desc=True).limit(500).execute().data
