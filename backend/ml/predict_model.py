from pathlib import Path

import joblib
import pandas as pd


MODEL_FILE = Path(__file__).resolve().parent / "risk_model.joblib"

FEATURE_COLUMNS = [
    "payment_type",
    "amount",
    "product_category",
    "quantity",
    "customer_type",
    "phone_verified",
    "email_verified",
    "address_complete",
    "distance_km",
    "previous_orders",
    "previous_returns",
    "order_hour",
    "coupon_used",
    "account_age_days",
    "current_stock",
    "avg_daily_sales",
    "shipping_speed",
    "discount_amount",
]

DEFAULTS = {
    "payment_type": "Prepaid",
    "amount": 0,
    "product_category": "General",
    "quantity": 1,
    "customer_type": "New",
    "phone_verified": "Yes",
    "email_verified": "Yes",
    "address_complete": "Yes",
    "distance_km": 0,
    "previous_orders": 0,
    "previous_returns": 0,
    "order_hour": 12,
    "coupon_used": "No",
    "account_age_days": 0,
    "current_stock": 0,
    "avg_daily_sales": 0,
    "shipping_speed": "Standard",
    "discount_amount": 0,
}

_MODEL = None


def _safe_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(value, default=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _load_model():
    global _MODEL
    if _MODEL is None:
        if not MODEL_FILE.exists():
            return None
        _MODEL = joblib.load(MODEL_FILE)
    return _MODEL


def _normalize_order(order):
    normalized = {column: order.get(column, DEFAULTS[column]) for column in FEATURE_COLUMNS}
    for column in [
        "amount",
        "distance_km",
        "discount_amount",
        "current_stock",
        "avg_daily_sales",
    ]:
        normalized[column] = _safe_float(normalized[column], DEFAULTS[column])
    for column in [
        "quantity",
        "previous_orders",
        "previous_returns",
        "order_hour",
        "account_age_days",
    ]:
        normalized[column] = _safe_int(normalized[column], DEFAULTS[column])
    return normalized


def predict_ml_risk(order: dict):
    try:
        model = _load_model()
        if model is None:
            return {
                "ml_available": False,
                "ml_probability": 0.0,
                "ml_score": 0,
                "ml_prediction": 0,
            }

        frame = pd.DataFrame([_normalize_order(order)], columns=FEATURE_COLUMNS)
        probability = float(model.predict_proba(frame)[0][1])
        score = int(round(probability * 100))
        return {
            "ml_available": True,
            "ml_probability": round(probability, 4),
            "ml_score": score,
            "ml_prediction": int(score >= 50),
        }
    except Exception:
        return {
            "ml_available": False,
            "ml_probability": 0.0,
            "ml_score": 0,
            "ml_prediction": 0,
        }


def predict_ml_risks(orders: list[dict]):
    fallback = {
        "ml_available": False,
        "ml_probability": 0.0,
        "ml_score": 0,
        "ml_prediction": 0,
    }
    if not orders:
        return []

    try:
        model = _load_model()
        if model is None:
            return [fallback.copy() for _ in orders]

        frame = pd.DataFrame(
            [_normalize_order(order) for order in orders],
            columns=FEATURE_COLUMNS,
        )
        probabilities = model.predict_proba(frame)[:, 1]
        results = []
        for probability in probabilities:
            probability = float(probability)
            score = int(round(probability * 100))
            results.append(
                {
                    "ml_available": True,
                    "ml_probability": round(probability, 4),
                    "ml_score": score,
                    "ml_prediction": int(score >= 50),
                }
            )
        return results
    except Exception:
        return [fallback.copy() for _ in orders]
