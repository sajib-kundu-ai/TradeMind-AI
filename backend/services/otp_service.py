import hashlib
import os
import secrets
import threading
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


@dataclass(frozen=True)
class OTPRecord:
    digest: str
    expires_at: datetime


_otp_store: dict[str, OTPRecord] = {}
_store_lock = threading.Lock()


def get_otp_expire_minutes() -> int:
    raw_value = os.getenv("OTP_EXPIRE_MINUTES", "5")
    try:
        value = int(raw_value)
    except ValueError:
        return 5
    return value if value > 0 else 5


def _digest(email: str, otp: str) -> str:
    return hashlib.sha256(f"{email}:{otp}".encode("utf-8")).hexdigest()


def create_otp(email: str) -> tuple[str, int]:
    otp = f"{secrets.randbelow(1_000_000):06d}"
    expires_minutes = get_otp_expire_minutes()
    record = OTPRecord(
        digest=_digest(email, otp),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=expires_minutes),
    )
    with _store_lock:
        _otp_store[email] = record
    return otp, expires_minutes


def invalidate_otp(email: str) -> None:
    with _store_lock:
        _otp_store.pop(email, None)


def verify_otp(email: str, otp: str) -> bool:
    now = datetime.now(timezone.utc)
    with _store_lock:
        record = _otp_store.get(email)
        if record is None:
            return False
        if record.expires_at <= now:
            _otp_store.pop(email, None)
            return False
        if not secrets.compare_digest(record.digest, _digest(email, otp)):
            return False
        _otp_store.pop(email, None)
        return True
