from fastapi import APIRouter
from ..supabase_client import supabase

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health():
    return {"status": "healthy", "service": "NyayaVault API"}

@router.get("/supabase")
def supabase_health():
    try:
        supabase.table("users").select("id").limit(1).execute()
        return {"status": "connected"}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}
