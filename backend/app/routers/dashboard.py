from fastapi import APIRouter, Depends
from ..dependencies import current_user
from ..supabase_client import supabase

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def stats(user=Depends(current_user)):
    cases = supabase.table("cases").select("id,status", count="exact").execute()
    active = supabase.table("cases").select("id", count="exact").eq("status", "Active").execute()
    pending = supabase.table("access_requests").select("id", count="exact").eq("status", "Pending").execute()
    return {"total_cases": cases.count or 0, "active_cases": active.count or 0, "pending_review": pending.count or 0}

