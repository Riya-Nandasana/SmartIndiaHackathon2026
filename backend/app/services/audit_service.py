from ..supabase_client import supabase

def audit(user_id, action, case_id=None, document_id=None, status="Success", details=None, ip_address=None, user_agent=None):
    payload = {
        "user_id": str(user_id) if user_id else None,
        "action": action,
        "case_id": str(case_id) if case_id else None,
        "document_id": str(document_id) if document_id else None,
        "status": status,
        "details": details or {},
        "ip_address": ip_address,
        "user_agent": user_agent,
    }
    supabase.table("audit_logs").insert(payload).execute()
