from pathlib import Path
import json
import shutil
from uuid import uuid4

import httpx
import pandas as pd
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
    from .services.stock_engine import (
        analyze_stock_file,
        analyze_stock_records,
        merge_stock_records,
        read_stock_file_records,
    )
    from .services.recommendation_engine import build_smart_suggestions
    from .services.text_order_parser import parse_order_text
    from .services.auth_service import (
        AuthConfigurationError,
        create_access_token,
        decode_current_user,
    )
    from .services.email_service import EmailConfigurationError, send_otp_email
    from .services.history_service import (
        create_analysis_run,
        create_stock_analysis_run,
        delete_analysis_run,
        delete_stock_analysis_run,
        get_analysis_run_for_user,
        get_latest_analysis_for_user,
        get_latest_stock_analysis_for_user,
        get_stock_analysis_run_for_user,
        list_analysis_runs,
        list_stock_analysis_runs,
        reanalyze_saved_payload,
        serialize_analysis_run,
        serialize_analysis_summary,
        serialize_stock_analysis_run,
        serialize_stock_analysis_summary,
        update_analysis_payload,
    )
    from .services.otp_service import create_otp, invalidate_otp, verify_otp
except ImportError:
    from database import get_db, init_db
    import models as models
    from services.risk_engine import analyze_risk_file, calculate_order_risk
    from services.profit_engine import analyze_profit_file
    from services.stock_engine import (
        analyze_stock_file,
        analyze_stock_records,
        merge_stock_records,
        read_stock_file_records,
    )
    from services.recommendation_engine import build_smart_suggestions
    from services.text_order_parser import parse_order_text
    from services.auth_service import (
        AuthConfigurationError,
        create_access_token,
        decode_current_user,
    )
    from services.email_service import EmailConfigurationError, send_otp_email
    from services.history_service import (
        create_analysis_run,
        create_stock_analysis_run,
        delete_analysis_run,
        delete_stock_analysis_run,
        get_analysis_run_for_user,
        get_latest_analysis_for_user,
        get_latest_stock_analysis_for_user,
        get_stock_analysis_run_for_user,
        list_analysis_runs,
        list_stock_analysis_runs,
        reanalyze_saved_payload,
        serialize_analysis_run,
        serialize_analysis_summary,
        serialize_stock_analysis_run,
        serialize_stock_analysis_summary,
        update_analysis_payload,
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


class TextPredictRequest(BaseModel):
    message: str


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
        return {
            "ml_available": False,
            "model_name": "Rule Engine fallback",
            "message": "ML metrics are not available yet. Train the model first.",
        }
    try:
        metrics = json.loads(MODEL_METRICS_FILE.read_text(encoding="utf-8"))
        return {
            "ml_available": True,
            "model_name": metrics.get("model_name") or "RandomForestClassifier",
            "training_rows": metrics.get("training_rows"),
            "test_rows": metrics.get("test_rows"),
            "accuracy": metrics.get("accuracy"),
            "precision": metrics.get("precision"),
            "recall": metrics.get("recall"),
            "f1": metrics.get("f1"),
            "confusion_matrix": metrics.get("confusion_matrix"),
            "top_features": metrics.get("top_features", []),
        }
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


@app.post("/api/predict-order-text")
def predict_order_text(request: TextPredictRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    parsed = parse_order_text(message)
    parsed_order = parsed["parsed_order"]
    result = calculate_order_risk(parsed_order)
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
        "source": "chat_input",
        "message": message,
        "parsed_order": parsed_order,
        "detected_fields": parsed["detected_fields"],
        "missing_fields": parsed["missing_fields"],
        "parser_confidence": parsed["parser_confidence"],
        "parser_notes": parsed["parser_notes"],
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
    run = get_analysis_run_for_user(db, analysis_id, email)
    if run is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return serialize_analysis_run(run)


@app.delete("/api/history/{analysis_id}")
def history_delete(
    analysis_id: int,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    run = get_analysis_run_for_user(db, analysis_id, email)
    if run is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    delete_analysis_run(db, run)
    return {"message": "Analysis deleted successfully"}


@app.get("/api/latest-analysis")
def latest_analysis(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    run = get_latest_analysis_for_user(db, email)
    if run is None:
        raise HTTPException(status_code=404, detail="No saved analysis found")
    return serialize_analysis_run(run)


@app.post("/api/history/{analysis_id}/reanalyze")
def history_reanalyze(
    analysis_id: int,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    run = get_analysis_run_for_user(db, analysis_id, email)
    if run is None:
        raise HTTPException(status_code=404, detail="Analysis not found")

    updated_payload = reanalyze_saved_payload(serialize_analysis_run(run))
    if updated_payload.get("error"):
        raise HTTPException(status_code=422, detail=updated_payload["error"])
    updated_run = update_analysis_payload(db, analysis_id, email, updated_payload)
    return {
        "message": "Analysis re-analyzed with latest AI model",
        "analysis": serialize_analysis_run(updated_run),
    }


@app.post("/api/latest-analysis/reanalyze")
def latest_analysis_reanalyze(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    run = get_latest_analysis_for_user(db, email)
    if run is None:
        raise HTTPException(status_code=404, detail="No saved analysis found")

    updated_payload = reanalyze_saved_payload(serialize_analysis_run(run))
    if updated_payload.get("error"):
        raise HTTPException(status_code=422, detail=updated_payload["error"])
    updated_run = update_analysis_payload(db, run.id, email, updated_payload)
    return {
        "message": "Latest analysis re-analyzed with latest AI model",
        "analysis": serialize_analysis_run(updated_run),
    }


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

    result["file_name"] = original_name
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


@app.post("/api/stock/upload-analysis")
async def upload_stock_analysis(
    file: UploadFile = File(...),
    merge: bool = Query(default=True),
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

        new_records = read_stock_file_records(str(saved_path))
    except pd.errors.EmptyDataError as exc:
        raise HTTPException(status_code=400, detail="Uploaded stock file is empty") from exc
    except (pd.errors.ParserError, UnicodeDecodeError) as exc:
        raise HTTPException(status_code=400, detail="Could not read stock file. Please upload a valid CSV or XLSX file") from exc
    except ValueError as exc:
        detail = str(exc)
        status_code = 400 if detail.startswith("Missing required stock columns") else 422
        raise HTTPException(status_code=status_code, detail=detail) from exc
    except OSError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    finally:
        await file.close()
        saved_path.unlink(missing_ok=True)

    user_email = optional_user_email(credentials)
    merge_stats = None
    result_records = new_records

    if user_email and merge:
        latest_run = get_latest_stock_analysis_for_user(db, user_email)
        if latest_run is not None:
            latest_payload = serialize_stock_analysis_run(latest_run)
            existing_items = latest_payload.get("stock_items") or []
            result_records, merge_stats = merge_stock_records(existing_items, new_records)

    result = analyze_stock_records(result_records)
    result["file_name"] = original_name
    result["uploaded_file"] = original_name
    result["saved"] = False
    result["analysis_id"] = None
    if merge_stats:
        result["merged"] = True
        result["merge_stats"] = merge_stats

    if user_email:
        run = create_stock_analysis_run(
            db,
            user_email=user_email,
            file_name=original_name,
            analysis=result,
        )
        result = serialize_stock_analysis_run(run)

    return result


@app.get("/api/stock/latest")
def latest_stock_analysis(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    run = get_latest_stock_analysis_for_user(db, email)
    if run is None:
        raise HTTPException(status_code=404, detail="No stock data found")
    return serialize_stock_analysis_run(run)


@app.get("/api/stock/history")
def stock_history_list(
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    runs = list_stock_analysis_runs(db, email)
    return [serialize_stock_analysis_summary(run) for run in runs]


@app.get("/api/stock/history/{analysis_id}")
def stock_history_detail(
    analysis_id: int,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    run = get_stock_analysis_run_for_user(db, analysis_id, email)
    if run is None:
        raise HTTPException(status_code=404, detail="Stock analysis not found")
    return serialize_stock_analysis_run(run)


@app.delete("/api/stock/history/{analysis_id}")
def stock_history_delete(
    analysis_id: int,
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
):
    run = get_stock_analysis_run_for_user(db, analysis_id, email)
    if run is None:
        raise HTTPException(status_code=404, detail="Stock analysis not found")
    delete_stock_analysis_run(db, run)
    return {"message": "Stock analysis deleted successfully"}
