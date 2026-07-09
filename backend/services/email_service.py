import os
from pathlib import Path

import httpx
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


class EmailConfigurationError(RuntimeError):
    """Raised when required email settings are unavailable."""


async def send_otp_email(recipient_email: str, otp: str, expires_minutes: int) -> None:
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("BREVO_SENDER_EMAIL")
    sender_name = os.getenv("BREVO_SENDER_NAME")

    if not all((api_key, sender_email, sender_name)):
        raise EmailConfigurationError(
            "Brevo email settings are not configured on the server"
        )

    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": recipient_email}],
        "subject": "Your TradeMind AI OTP Code",
        "htmlContent": (
            "<div style=\"font-family:Arial,sans-serif;color:#172033;line-height:1.6\">"
            "<h2>TradeMind AI sign-in</h2>"
            "<p>Use the following one-time code to complete your sign-in:</p>"
            f"<p style=\"font-size:28px;font-weight:700;letter-spacing:6px\">{otp}</p>"
            f"<p>This code expires in {expires_minutes} minutes. "
            "If you did not request it, you can safely ignore this email.</p>"
            "<p>— Lossless Labs</p></div>"
        ),
    }
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(BREVO_API_URL, json=payload, headers=headers)
        response.raise_for_status()
