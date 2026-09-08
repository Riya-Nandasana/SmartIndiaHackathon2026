import hashlib
from cryptography.fernet import Fernet

# For production, store a Fernet key in a secret manager/env variable.
# This helper is intentionally separate so it can be replaced with envelope encryption/KMS later.
def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def encrypt_bytes(data: bytes, key: bytes) -> bytes:
    return Fernet(key).encrypt(data)

def decrypt_bytes(data: bytes, key: bytes) -> bytes:
    return Fernet(key).decrypt(data)
