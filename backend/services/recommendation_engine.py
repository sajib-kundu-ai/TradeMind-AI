def _dedupe(items):
    seen = set()
    result = []
    for item in items:
        if item and item not in seen:
            seen.add(item)
            result.append(item)
    return result


def build_smart_suggestions(risk_summary=None, profit_summary=None, stock_summary=None, risk_orders=None, profit_products=None, stock_items=None):
    risk_summary = risk_summary or {}
    profit_summary = profit_summary or {}
    stock_summary = stock_summary or {}
    risk_orders = risk_orders or []
    profit_products = profit_products or []
    stock_items = stock_items or []

    total_orders = int(risk_summary.get("total_orders") or 0)
    high_risk = int(risk_summary.get("high_risk") or 0)
    medium_risk = int(risk_summary.get("medium_risk") or 0)
    profit_margin = float(profit_summary.get("profit_margin") or 0)
    low_margin_count = int(profit_summary.get("low_margin_products") or 0)
    restock_needed = int(stock_summary.get("restock_needed") or 0)
    critical_stock = int(stock_summary.get("critical_stock") or 0)
    high_risk_rate = (high_risk / total_orders) if total_orders else 0

    if high_risk_rate >= 0.25 or high_risk >= 10:
        overall_health = "Needs attention"
    elif profit_margin < 15 or restock_needed > 0:
        overall_health = "Watch closely"
    else:
        overall_health = "Healthy"

    priority_actions = []
    if high_risk:
        priority_actions.append(f"Verify {high_risk} high-risk orders before shipping.")
    if medium_risk:
        priority_actions.append(f"Send confirmation messages for {medium_risk} medium-risk orders.")
    if critical_stock:
        priority_actions.append(f"Restock {critical_stock} critical products before running ads.")
    if low_margin_count:
        priority_actions.append(f"Review pricing and shipping cost for {low_margin_count} low-margin products.")
    if not priority_actions:
        priority_actions.append("Keep processing healthy orders and review the queue daily.")

    high_value_risky = any(
        str(order.get("risk_level", "")).lower() == "high" and float(order.get("amount") or 0) >= 5000
        for order in risk_orders
    )
    cod_risky = any(
        str(order.get("suggested_action", "")).lower().find("verify") >= 0
        for order in risk_orders
    )
    risk_suggestions = [
        "Verify high-risk COD/high-value orders before shipping." if high_value_risky or cod_risky else "Confirm medium-risk orders before fulfillment.",
        "Call customers with unverified phone or incomplete address.",
        "Ask partial advance payment for high-value risky orders.",
        "Hold shipment if the customer does not respond.",
    ]

    profit_suggestions = []
    if profit_margin < 15:
        profit_suggestions.append("Review low-margin products and increase price or reduce delivery cost.")
    else:
        profit_suggestions.append("Protect healthy margins by prioritizing profitable products in campaigns.")
    if low_margin_count:
        names = [item.get("product_name") for item in profit_products if item.get("status") == "Low Margin"]
        if names:
            profit_suggestions.append(f"Check low-margin SKUs first: {', '.join(names[:3])}.")

    stock_suggestions = []
    if restock_needed:
        stock_suggestions.append("Restock products with low stock before running ads.")
        names = [item.get("product_name") for item in stock_items if item.get("status") in {"Critical", "Warning"}]
        if names:
            stock_suggestions.append(f"Prioritize stock for: {', '.join(names[:3])}.")
    else:
        stock_suggestions.append("Stock position is healthy; continue monitoring fast-moving products.")

    seller_next_steps = [
        "Open the high-risk queue and call customers marked for verification.",
        "Hold shipments where phone or address confirmation fails.",
        "Export report and review risk queue daily.",
        "Update stock before scaling ads for products with warning or critical status.",
    ]

    return {
        "overall_health": overall_health,
        "priority_actions": _dedupe(priority_actions),
        "risk_suggestions": _dedupe(risk_suggestions),
        "profit_suggestions": _dedupe(profit_suggestions),
        "stock_suggestions": _dedupe(stock_suggestions),
        "seller_next_steps": _dedupe(seller_next_steps),
    }
