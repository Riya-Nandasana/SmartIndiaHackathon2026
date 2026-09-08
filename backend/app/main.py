from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings

from .routers import (
    health,
    auth,
    users,
    admin,
    cases,
    documents,
    evidence,
    audit,
    sharing,
    dashboard,
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="NyayaVault API",
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # React / Vite
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # React / Create React App
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        # Configured frontend URL
        settings.frontend_url,
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    health.router
)

app.include_router(
    auth.router
)

app.include_router(
    users.router
)

app.include_router(
    admin.router
)

app.include_router(
    cases.router
)

app.include_router(
    documents.router
)

app.include_router(
    evidence.router
)

app.include_router(
    audit.router
)

app.include_router(
    sharing.router
)

app.include_router(
    dashboard.router
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "NyayaVault Backend is running",
        "docs": "/docs",
    }