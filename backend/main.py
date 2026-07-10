from pathlib import Path
import json
import shutil
from uuid import uuid4

import httpx
from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr, Field

try:
    from .database import get_db, init_db
    from . import models as models
    from .services.risk_engine import analyze_risk_file, calculate_order_risk
    from .services.profit_engine import analyze_profit_file
    from .services.stock_engine import analyze_stock_file
    from .services.recommendation_engine import build_smart_suggestions
    from .services.auth_service import (
        AuthConfigurationError,
        create_access_token,
        decode_current_user,
    )
    from .services.email_service import EmailConfigurationError, send_otp_email
    from .services.history_service import (
        create_analysis_run,
        delete_analysis_run,
        get_analysis_run,
        get_latest_analysis_run,
        list_analysis_runs,
        serialize_analysis_run,
        serialize_analysis_summary,
    )
    from .services.otp_service import create_otp, invalidate_otp, verify_otp
except ImportError:
    from database import get_db, init_db
    import models as models
    from services.risk_engine import analyze_risk_file, calculate_order_risk
    from services.profit_engine import analyze_profit_file
    from services.stock_engine import analyze_stock_file
    from services.recommendation_engine import build_smart_suggestions
    from services.auth_service import (
        AuthConfigurationError,
        create_access_token,
        decode_current_user,
    )
    from services.email_service import EmailConfigurationError, send_otp_email
    from services.history_service import (
        create_analysis_run,
        delete_analysis_run,
        get_analysis_run,
        get_latest_analysis_run,
        list_analysis_runs,
        serialize_analysis_run,
        serialize_analysis_summary,
    )
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
MODEL_METRICS_FILE = BASE_DIR / "ml" / "model_metrics.json"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
bearer_scheme = HTTPBearer(auto_error=False)

init_db()


class EmailRequest(BaseModel):
    email: EmailStr


class OTPVerifyRequest(EmailRequest):
    otp: str = Field(pattern=r"^\d{6}$")


class ManualOrderRequest(BaseModel):
    order_id: str | None = None
    product_name: str | None = None
    product_category: str = "General"
    payment_type: str = "Prepaid"
    shipping_speed: str = "Standard"
    amount: float = 0
    quantity: int = 1
    customer_type: str = "New"
    phone_verified: str = "Yes"
    email_verified: str = "Yes"
    address_complete: str = "Yes"
    distance_km: float = 0
    previous_orders: int = 0
    previous_returns: int = 0
    order_hour: int = 12
    coupon_used: str = "No"
    account_age_days: int = 0
    current_stock: float = 0
    avg_daily_sales: float = 0
    discount_amount: float = 0


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


def optional_user_email(
    credentials: HTTPAuthorizationCredentials | None,
) -> str | None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None
    try:
        return decode_current_user(credentials.credentials)
    except (AuthConfigurationError, ValueError):
        return None


def build_analysis(file_path: str, limit: int = 20):
    risk = analyze_risk_file(file_path)
    profit = analyze_profit_file(file_path)
    stock = analyze_stock_file(file_path)
    risk_orders = risk["orders"][:limit]
    profit_products = profit["products"][:limit]
    stock_items = stock["stocks"][:limit]

    return {
        "risk_summary": risk["summary"],
        "profit_summary": profit["summary"],
        "stock_summary": stock["summary"],
        "risk_orders": risk_orders,
        "profit_products": profit_products,
        "stock_items": stock_items,
        "smart_suggestions": build_smart_suggestions(
            risk["summary"],
            profit["summary"],
            stock["summary"],
            risk_orders,
            profit_products,
            stock_items,
        ),
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


@app.get("/api/model-metrics")
def model_metrics():
    if not MODEL_METRICS_FILE.exists():
        return {"ml_available": False, "detail": "ML model metrics are not available yet."}
    try:
        return {"ml_available": True, **json.loads(MODEL_METRICS_FILE.read_text(encoding="utf-8"))}
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/predict-order")
def predict_order(request: ManualOrderRequest):
    order = request.model_dump()
    order["order_id"] = order.get("order_id") or "MANUAL-PREDICT"
    order["product_name"] = order.get("product_name") or "Manual Order"
    result = calculate_order_risk(order)
    suggestions = build_smart_suggestions(
        {
            "total_orders": 1,
            "high_risk": 1 if result["risk_level"] == "High" else 0,
            "medium_risk": 1 if result["risk_level"] == "Medium" else 0,
            "low_risk": 1 if result["risk_level"] == "Low" else 0,
        },
        {"profit_margin": 0, "low_margin_products": 0},
        {"restock_needed": 0, "critical_stock": 0},
        [result],
        [],
        [],
    )
    return {
        "order": result,
        "smart_suggestions": suggestions,
    }


@app.get("/api/history")
def history_list(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    runs = list_analysis_runs(db, email)
    return [serialize_analysis_summary(run) for run in runs]


@app.get("/api/history/{analysis_id}")
def history_detail(
    analysis_id: int,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    run = get_analysis_run(db, email, analysis_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return serialize_analysis_run(run)


@app.delete("/api/history/{analysis_id}")
def history_delete(
    analysis_id: int,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    run = get_analysis_run(db, email, analysis_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    delete_analysis_run(db, run)
    return {"message": "Analysis deleted successfully"}


@app.get("/api/latest-analysis")
def latest_analysis(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    run = get_latest_analysis_run(db, email)
    if run is None:
        raise HTTPException(status_code=404, detail="No saved analysis found")
    return serialize_analysis_run(run)


@app.post("/api/upload-analysis")
async def upload_analysis(
    file: UploadFile = File(...),
    limit: int = Query(default=20, ge=1, le=100),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
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
    result["saved"] = False
    result["analysis_id"] = None

    user_email = optional_user_email(credentials)
    if user_email:
        run = create_analysis_run(
            db,
            user_email=user_email,
            file_name=original_name,
            analysis=result,
        )
        result["saved"] = True
        result["analysis_id"] = run.id

    return result
