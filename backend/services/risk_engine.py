import pandas as pd


def _yes_no(value):
    return str(value).strip().lower()


def _risk_level(score):
    if score >= 75:
        return "High"
    if score >= 50:
        return "Medium"
    return "Low"


def _suggest_action(level):
    if level == "High":
        return "Call customer and verify before shipping"
    if level == "Medium":
        return "Send confirmation message before shipping"
    return "Ship normally"


def calculate_order_risk(order):
    score = 0
    reasons = []

    payment_type = str(order.get("payment_type", "")).strip().lower()
    customer_type = str(order.get("customer_type", "")).strip().lower()

    amount = float(order.get("amount", 0) or 0)
    distance = float(order.get("distance_km", 0) or 0)
    previous_returns = int(order.get("previous_returns", 0) or 0)
    order_hour = int(order.get("order_hour", 12) or 12)

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
    level = _risk_level(score)

    return {
        "order_id": order.get("order_id"),
        "product_name": order.get("product_name"),
        "product_category": order.get("product_category"),
        "amount": amount,
        "risk_score": score,
        "risk_level": level,
        "reasons": reasons,
        "suggested_action": _suggest_action(level),
    }


def analyze_risk_dataframe(df):
    required_columns = [
        "order_id", "product_name", "product_category", "payment_type", "amount",
        "customer_type", "phone_verified", "address_complete", "distance_km",
        "previous_returns", "order_hour",
    ]
    missing = [column for column in required_columns if column not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")

    results = [calculate_order_risk(row) for row in df.to_dict(orient="records")]

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
