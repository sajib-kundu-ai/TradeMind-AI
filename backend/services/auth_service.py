import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import JWTError, jwt


ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class AuthConfigurationError(RuntimeError):
    """Raised when required authentication settings are unavailable."""


def _jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET_KEY")
    if not secret:
        raise AuthConfigurationError("JWT authentication is not configured on the server")
    return secret


def create_access_token(email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "email": email,
        "iat": now,
        "exp": now + timedelta(days=TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=ALGORITHM)


def decode_current_user(token: str) -> str:
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid or expired authentication token") from exc

    email = payload.get("email") or payload.get("sub")
    if not isinstance(email, str) or not email:
        raise ValueError("Authentication token does not contain a user")
    return email
