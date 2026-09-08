import smtplib
from email.message import EmailMessage
from . import __name__
from ..config import settings

def send_otp_email(to_email: str, otp: str):
    if not all([settings.smtp_host, settings.smtp_username, settings.smtp_password, settings.smtp_from]):
        print(f"[DEV OTP] {to_email}: {otp}")
        return
    msg = EmailMessage()
    msg["Subject"] = "NyayaVault OTP Verification"
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg.set_content(f"Your NyayaVault verification OTP is {otp}. It expires in 10 minutes.")
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(msg)
