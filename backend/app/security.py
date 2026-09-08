from datetime import datetime, timedelta, timezone
import hashlib
import secrets
import jwt
from passlib.context import CryptContext
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()

def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"

def create_access_token(user: dict) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user["id"]),
        "role": user.get("role"),
        "email": user.get("email"),
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
