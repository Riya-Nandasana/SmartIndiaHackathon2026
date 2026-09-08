from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .security import decode_access_token
from .supabase_client import supabase

bearer = HTTPBearer()

def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError()
        result = supabase.table("users").select("*").eq("id", user_id).single().execute()
        user = result.data
        if not user or user.get("status") != "Active":
            raise HTTPException(status_code=403, detail="User is not active")
        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

def require_roles(*roles):
    def checker(user=Depends(current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker
