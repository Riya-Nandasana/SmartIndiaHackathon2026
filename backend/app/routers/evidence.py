from fastapi import APIRouter, Depends
from ..dependencies import current_user
from ..supabase_client import supabase

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.get("/case/{case_id}")
def case_evidence(case_id: str, user=Depends(current_user)):
    return supabase.table("evidence").select("*").eq("case_id", case_id).order("created_at", desc=True).execute().data
