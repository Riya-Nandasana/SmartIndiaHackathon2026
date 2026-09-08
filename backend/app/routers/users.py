from fastapi import APIRouter, Depends
from ..dependencies import current_user
from ..supabase_client import supabase

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def me(user=Depends(current_user)):
    return user

@router.get("")
def list_users(user=Depends(current_user)):
    return supabase.table("users").select("*").order("created_at", desc=True).execute().data
