from pathlib import Path
import shutil
from uuid import uuid4

import httpx
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr, Field

try:
    from .services.risk_engine import analyze_risk_file
    from .services.profit_engine import analyze_profit_file
    from .services.stock_engine import analyze_stock_file
    from .services.auth_service import (
        AuthConfigurationError,
        create_access_token,
        decode_current_user,
    )
    from .services.email_service import EmailConfigurationError, send_otp_email
    from .services.otp_service import create_otp, invalidate_otp, verify_otp
except ImportError:
    from services.risk_engine import analyze_risk_file
    from services.profit_engine import analyze_profit_file
    from services.stock_engine import analyze_stock_file
    from services.auth_service import (
        AuthConfigurationError,
        create_access_token,
        decode_current_user,
    )
    from services.email_service import EmailConfigurationError, send_otp_email
    from services.otp_service import create_otp, invalidate_otp, verify_otp

app = FastAPI(title="TradeMind AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "sample_orders.csv"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
bearer_scheme = HTTPBearer(auto_error=False)


class EmailRequest(BaseModel):
    email: EmailStr


class OTPVerifyRequest(EmailRequest):
    otp: str = Field(pattern=r"^\d{6}$")


def normalized_email(email: EmailStr) -> str:
    return str(email).strip().lower()


def current_user_email(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        return decode_current_user(credentials.credentials)
    except AuthConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


def build_analysis(file_path: str, limit: int = 20):
    risk = analyze_risk_file(file_path)
    profit = analyze_profit_file(file_path)
    stock = analyze_stock_file(file_path)

    return {
        "risk_summary": risk["summary"],
        "profit_summary": profit["summary"],
        "stock_summary": stock["summary"],
        "risk_orders": risk["orders"][:limit],
        "profit_products": profit["products"][:limit],
        "stock_items": stock["stocks"][:limit],
    }


@app.get("/")
def root():
    return {"message": "TradeMind AI backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/auth/request-otp")
async def request_otp(request: EmailRequest):
    email = normalized_email(request.email)
    otp, expires_minutes = create_otp(email)
    try:
        await send_otp_email(email, otp, expires_minutes)
    except EmailConfigurationError as exc:
        invalidate_otp(email)
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except httpx.HTTPError as exc:
        invalidate_otp(email)
        raise HTTPException(status_code=502, detail="Unable to send OTP email") from exc
    return {"message": "OTP sent successfully"}


@app.post("/api/auth/verify-otp")
def verify_login_otp(request: OTPVerifyRequest):
    email = normalized_email(request.email)
    if not verify_otp(email, request.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    try:
        token = create_access_token(email)
    except AuthConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"access_token": token, "token_type": "bearer", "email": email}


@app.get("/api/auth/me")
def auth_me(email: str = Depends(current_user_email)):
    return {"email": email}


@app.get("/api/demo-analysis")
def demo_analysis(limit: int = Query(default=20, ge=1, le=100)):
    try:
        return build_analysis(str(DATA_FILE), limit)
    except (OSError, ValueError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/sample-orders", response_class=FileResponse)
def sample_orders():
    return FileResponse(DATA_FILE, filename="sample_orders.csv", media_type="text/csv")


@app.post("/api/upload-analysis")
async def upload_analysis(
    file: UploadFile = File(...),
    limit: int = Query(default=20, ge=1, le=100),
):
    original_name = Path(file.filename or "upload").name
    file_extension = Path(original_name).suffix.lower()

    if file_extension not in [".csv", ".xlsx"]:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel .xlsx files are supported",
        )

    saved_path = UPLOAD_DIR / f"{uuid4().hex}{file_extension}"

    try:
        with saved_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = build_analysis(str(saved_path), limit)
    except (OSError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    finally:
        await file.close()
        saved_path.unlink(missing_ok=True)

    result["uploaded_file"] = original_name

    return result
