# NyayaVault Backend

FastAPI backend for the existing NyayaVault React frontend.

## 1. Setup

Open a terminal in this folder:

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your Supabase URL and server-side secret key. Never put the secret key in React or GitHub.

## 2. Storage

Create these private Supabase Storage buckets:

- `authorization-documents`
- `case-documents`
- `evidence-files`
- `forensic-reports`

The document upload endpoint currently uses `case-documents`.

## 3. Run

```powershell
uvicorn app.main:app --reload --port 8000
```

Open http://127.0.0.1:8000/docs

## 4. Current API

- POST `/auth/login`
- POST `/auth/verify-otp`
- POST `/auth/access-request`
- GET `/users/me`
- GET/PATCH `/admin/access-requests...`
- GET/POST `/cases`
- GET `/cases/{case_id}`
- POST `/documents/case/{case_id}/upload`
- GET `/documents/case/{case_id}`
- GET `/evidence/case/{case_id}`
- POST/GET `/sharing...`
- GET `/audit`
- GET `/dashboard/stats`

## Important

The existing React login screen currently asks for Government ID + mobile, while this backend authentication endpoint uses email OTP. The React login page must therefore be changed to send email (or a real SMS provider must be added). This backend does not pretend to send SMS when no provider is configured.

OCR, AI analysis, full encryption-at-rest, version editing, and complete RBAC policies are intentionally separate next modules; the database tables already exist and the API structure is ready to extend them.
