import pandas as pd

try:
    from ..ml.predict_model import predict_ml_risk, predict_ml_risks
except ImportError:
    from ml.predict_model import predict_ml_risk, predict_ml_risks


def _yes_no(value):
    return str(value).strip().lower()


def _safe_float(value, default=0.0):
    if value is None or pd.isna(value):
        return default
    if isinstance(value, str):
        value = value.strip().replace(",", "")
        if not value:
            return default
    try:
        number = float(value)
        return default if pd.isna(number) else number
    except (TypeError, ValueError):
        return default


def _safe_int(value, default=0):
    try:
        return int(_safe_float(value, default))
    except (TypeError, ValueError):
        return default


def _risk_level(score):
    if score >= 75:
        return "High"
    if score >= 50:
        return "Medium"
    return "Low"


def _suggest_action(level):
    if level == "High":
        return "Call customer, verify phone/address, and consider partial advance payment before shipping"
    if level == "Medium":
        return "Send confirmation message before shipping"
    return "Ship normally"


def calculate_order_risk(order, ml_result=None):
    score = 0
    reasons = []

    payment_type = str(order.get("payment_type", "")).strip().lower()
    customer_type = str(order.get("customer_type", "")).strip().lower()

    amount = _safe_float(order.get("amount"), 0)
    distance = _safe_float(order.get("distance_km"), 0)
    previous_returns = _safe_int(order.get("previous_returns"), 0)
    order_hour = _safe_int(order.get("order_hour"), 12)

    phone_verified = _yes_no(order.get("phone_verified", "Yes"))
    address_complete = _yes_no(order.get("address_complete", "Yes"))

    if payment_type == "cod":
        score += 20
        reasons.append("COD order")

    if phone_verified == "no":
        score += 20
        reasons.append("Phone not verified")

    if address_complete == "no":
        score += 15
        reasons.append("Incomplete address")

    if customer_type == "new":
        score += 10
        reasons.append("New customer")

    if amount >= 5000:
        score += 15
        reasons.append("High order amount")

    if distance >= 50:
        score += 10
        reasons.append("Long distance delivery")

    if previous_returns > 0:
        score += 15
        reasons.append("Previous return history")

    if order_hour >= 22 or order_hour <= 3:
        score += 10
        reasons.append("Late night order")

    score = min(score, 100)
    ml_result = ml_result or predict_ml_risk(order)
    ml_score = int(ml_result.get("ml_score") or 0)
    if ml_result.get("ml_available"):
        final_score = round((score * 0.6) + (ml_score * 0.4), 2)
    else:
        final_score = float(score)
    level = _risk_level(final_score)

    return {
        "order_id": order.get("order_id"),
        "product_name": order.get("product_name"),
        "product_category": order.get("product_category"),
        "amount": amount,
        "risk_score": final_score,
        "rule_score": score,
        "ml_score": ml_score,
        "ml_confidence": ml_result.get("ml_probability", 0.0),
        "ml_available": bool(ml_result.get("ml_available")),
        "final_risk_score": final_score,
        "risk_level": level,
        "reasons": reasons,
        "suggested_action": _suggest_action(level),
    }


def analyze_risk_dataframe(df):
    df = df.copy()
    df.columns = [str(column).strip() for column in df.columns]
    required_columns = [
        "order_id", "product_name", "product_category", "payment_type", "amount",
        "customer_type", "phone_verified", "address_complete", "distance_km",
        "previous_returns", "order_hour",
    ]
    missing = [column for column in required_columns if column not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")

    records = df.to_dict(orient="records")
    ml_results = predict_ml_risks(records)
    results = [
        calculate_order_risk(row, ml_result)
        for row, ml_result in zip(records, ml_results)
    ]

    total_orders = len(results)
    high_risk = len([item for item in results if item["risk_level"] == "High"])
    medium_risk = len([item for item in results if item["risk_level"] == "Medium"])
    low_risk = len([item for item in results if item["risk_level"] == "Low"])

    return {
        "summary": {
            "total_orders": total_orders,
            "high_risk": high_risk,
            "medium_risk": medium_risk,
            "low_risk": low_risk,
        },
        "orders": results,
    }


def analyze_risk_file(file_path):
    if file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    return analyze_risk_dataframe(df)
