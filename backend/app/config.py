from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    jwt_secret_key: str
    jwt_expire_minutes: int = 480
    frontend_url: str = "http://localhost:5173"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from: str | None = None
    dev_return_otp: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
