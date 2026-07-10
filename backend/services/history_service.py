import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

try:
    from ..models import AnalysisRun, StockAnalysisRun
    from .recommendation_engine import build_smart_suggestions
    from .risk_engine import calculate_order_risk
except ImportError:
    from models import AnalysisRun, StockAnalysisRun
    from services.recommendation_engine import build_smart_suggestions
    from services.risk_engine import calculate_order_risk


def _to_json(value: Any) -> str:
    return json.dumps(value or [], ensure_ascii=False)


def _from_json(value: str, fallback: Any) -> Any:
    if not value:
        return fallback
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return fallback


def create_analysis_run(
    db: Session,
    *,
    user_email: str,
    file_name: str,
    analysis: dict[str, Any],
) -> AnalysisRun:
    risk_summary = analysis.get("risk_summary") or {}
    profit_summary = analysis.get("profit_summary") or {}
    stock_summary = analysis.get("stock_summary") or {}

    run = AnalysisRun(
        user_email=user_email,
        file_name=file_name,
        total_orders=int(risk_summary.get("total_orders") or 0),
        high_risk_orders=int(risk_summary.get("high_risk") or 0),
        net_profit=float(profit_summary.get("net_profit") or 0),
        restock_needed=int(stock_summary.get("restock_needed") or 0),
        risk_summary=_to_json(risk_summary),
        profit_summary=_to_json(profit_summary),
        stock_summary=_to_json(stock_summary),
        risk_orders=_to_json(analysis.get("risk_orders") or []),
        profit_products=_to_json(analysis.get("profit_products") or []),
        stock_items=_to_json(analysis.get("stock_items") or []),
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def list_analysis_runs(db: Session, user_email: str) -> list[AnalysisRun]:
    return (
        db.query(AnalysisRun)
        .filter(AnalysisRun.user_email == user_email)
        .order_by(AnalysisRun.created_at.desc(), AnalysisRun.id.desc())
        .all()
    )


def get_analysis_run(db: Session, user_email: str, analysis_id: int) -> AnalysisRun | None:
    return (
        db.query(AnalysisRun)
        .filter(AnalysisRun.user_email == user_email, AnalysisRun.id == analysis_id)
        .first()
    )


def get_analysis_run_for_user(
    db: Session,
    analysis_id: int,
    user_email: str,
) -> AnalysisRun | None:
    return get_analysis_run(db, user_email, analysis_id)


def get_latest_analysis_run(db: Session, user_email: str) -> AnalysisRun | None:
    return (
        db.query(AnalysisRun)
        .filter(AnalysisRun.user_email == user_email)
        .order_by(AnalysisRun.created_at.desc(), AnalysisRun.id.desc())
        .first()
    )


def get_latest_analysis_for_user(db: Session, user_email: str) -> AnalysisRun | None:
    return get_latest_analysis_run(db, user_email)


def delete_analysis_run(db: Session, run: AnalysisRun) -> None:
    db.delete(run)
    db.commit()


def _summary_from_orders(orders: list[dict[str, Any]]) -> dict[str, int]:
    return {
        "total_orders": len(orders),
        "high_risk": len([item for item in orders if item.get("risk_level") == "High"]),
        "medium_risk": len([item for item in orders if item.get("risk_level") == "Medium"]),
        "low_risk": len([item for item in orders if item.get("risk_level") == "Low"]),
    }


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _is_high_risk(order: dict[str, Any]) -> bool:
    if str(order.get("risk_level", "")).lower() == "high":
        return True
    return _safe_float(order.get("final_risk_score", order.get("risk_score")), 0) >= 75


def _rebuild_order(order: dict[str, Any]) -> dict[str, Any]:
    high_risk = _is_high_risk(order)
    return {
        "order_id": order.get("order_id") or order.get("id") or "REANALYZED-ORDER",
        "product_name": order.get("product_name") or "Unknown Product",
        "product_category": order.get("product_category") or "General",
        "payment_type": order.get("payment_type") or ("COD" if high_risk else "Prepaid"),
        "amount": _safe_float(order.get("amount"), 0),
        "quantity": _safe_int(order.get("quantity"), 1),
        "customer_type": order.get("customer_type") or "New",
        "phone_verified": order.get("phone_verified") or "Yes",
        "email_verified": order.get("email_verified") or "Yes",
        "address_complete": order.get("address_complete") or "Yes",
        "distance_km": _safe_float(order.get("distance_km"), 10),
        "previous_orders": _safe_int(order.get("previous_orders"), 0),
        "previous_returns": _safe_int(order.get("previous_returns"), 0),
        "order_hour": _safe_int(order.get("order_hour"), 14),
        "coupon_used": order.get("coupon_used") or "No",
        "account_age_days": _safe_int(order.get("account_age_days"), 30),
        "current_stock": _safe_float(order.get("current_stock"), 20),
        "avg_daily_sales": _safe_float(order.get("avg_daily_sales"), 2),
        "shipping_speed": order.get("shipping_speed") or "Standard",
        "discount_amount": _safe_float(order.get("discount_amount"), 0),
    }


def reanalyze_saved_payload(payload: dict[str, Any]) -> dict[str, Any]:
    payload = payload or {}
    original_orders = payload.get("risk_orders") or []
    if not isinstance(original_orders, list) or not original_orders:
        return {"error": "No risk orders found to re-analyze."}

    risk_orders = [
        calculate_order_risk(_rebuild_order(order if isinstance(order, dict) else {}))
        for order in original_orders
    ]
    risk_summary = _summary_from_orders(risk_orders)
    profit_summary = payload.get("profit_summary") or {}
    profit_products = payload.get("profit_products") or []
    stock_summary = payload.get("stock_summary") or {}
    stock_items = payload.get("stock_items") or []

    updated_payload = {
        **payload,
        "risk_summary": risk_summary,
        "profit_summary": profit_summary,
        "stock_summary": stock_summary,
        "risk_orders": risk_orders,
        "profit_products": profit_products,
        "stock_items": stock_items,
        "smart_suggestions": build_smart_suggestions(
            risk_summary,
            profit_summary,
            stock_summary,
            risk_orders,
            profit_products,
            stock_items,
        ),
        "reanalyzed": True,
        "reanalyzed_at": datetime.now(timezone.utc).isoformat(),
        "analysis_version": "ml-v2",
    }
    return updated_payload


def update_analysis_payload(
    db: Session,
    analysis_id: int,
    user_email: str,
    updated_payload: dict[str, Any],
) -> AnalysisRun | None:
    run = get_analysis_run(db, user_email, analysis_id)
    if run is None:
        return None

    risk_summary = updated_payload.get("risk_summary") or {}
    profit_summary = updated_payload.get("profit_summary") or {}
    stock_summary = updated_payload.get("stock_summary") or {}

    run.file_name = (
        updated_payload.get("file_name")
        or updated_payload.get("uploaded_file")
        or run.file_name
    )
    run.total_orders = int(risk_summary.get("total_orders") or 0)
    run.high_risk_orders = int(risk_summary.get("high_risk") or 0)
    run.net_profit = float(profit_summary.get("net_profit") or 0)
    run.restock_needed = int(stock_summary.get("restock_needed") or 0)
    run.risk_summary = _to_json(risk_summary)
    run.profit_summary = _to_json(profit_summary)
    run.stock_summary = _to_json(stock_summary)
    run.risk_orders = _to_json(updated_payload.get("risk_orders") or [])
    run.profit_products = _to_json(updated_payload.get("profit_products") or [])
    run.stock_items = _to_json(updated_payload.get("stock_items") or [])
    run.reanalyzed_at = updated_payload.get("reanalyzed_at")
    run.analysis_version = updated_payload.get("analysis_version")
    db.commit()
    db.refresh(run)
    return run


def serialize_analysis_summary(run: AnalysisRun) -> dict[str, Any]:
    return {
        "id": run.id,
        "file_name": run.file_name,
        "total_orders": run.total_orders,
        "high_risk_orders": run.high_risk_orders,
        "net_profit": run.net_profit,
        "restock_needed": run.restock_needed,
        "created_at": run.created_at.isoformat(),
        "reanalyzed_at": run.reanalyzed_at,
        "analysis_version": run.analysis_version,
    }


def serialize_analysis_run(run: AnalysisRun) -> dict[str, Any]:
    risk_summary = _from_json(run.risk_summary, {})
    profit_summary = _from_json(run.profit_summary, {})
    stock_summary = _from_json(run.stock_summary, {})
    risk_orders = _from_json(run.risk_orders, [])
    profit_products = _from_json(run.profit_products, [])
    stock_items = _from_json(run.stock_items, [])

    return {
        **serialize_analysis_summary(run),
        "uploaded_file": run.file_name,
        "risk_summary": risk_summary,
        "profit_summary": profit_summary,
        "stock_summary": stock_summary,
        "risk_orders": risk_orders,
        "profit_products": profit_products,
        "stock_items": stock_items,
        "smart_suggestions": build_smart_suggestions(
            risk_summary,
            profit_summary,
            stock_summary,
            risk_orders,
            profit_products,
            stock_items,
        ),
        "saved": True,
        "analysis_id": run.id,
        "reanalyzed": bool(run.reanalyzed_at),
    }


def create_stock_analysis_run(
    db: Session,
    *,
    user_email: str,
    file_name: str,
    analysis: dict[str, Any],
) -> StockAnalysisRun:
    stock_summary = analysis.get("stock_summary") or {}
    payload = {
        **analysis,
        "uploaded_file": file_name,
        "saved": True,
    }
    run = StockAnalysisRun(
        user_email=user_email,
        file_name=file_name,
        total_products=int(stock_summary.get("total_products") or 0),
        critical_stock=int(stock_summary.get("critical_stock") or 0),
        warning_stock=int(stock_summary.get("warning_stock") or 0),
        healthy_stock=int(stock_summary.get("healthy_stock") or 0),
        restock_needed=int(stock_summary.get("restock_needed") or 0),
        payload_json=_to_json(payload),
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def list_stock_analysis_runs(db: Session, user_email: str) -> list[StockAnalysisRun]:
    return (
        db.query(StockAnalysisRun)
        .filter(StockAnalysisRun.user_email == user_email)
        .order_by(StockAnalysisRun.created_at.desc(), StockAnalysisRun.id.desc())
        .all()
    )


def get_stock_analysis_run_for_user(
    db: Session,
    analysis_id: int,
    user_email: str,
) -> StockAnalysisRun | None:
    return (
        db.query(StockAnalysisRun)
        .filter(
            StockAnalysisRun.user_email == user_email,
            StockAnalysisRun.id == analysis_id,
        )
        .first()
    )


def get_latest_stock_analysis_for_user(
    db: Session,
    user_email: str,
) -> StockAnalysisRun | None:
    return (
        db.query(StockAnalysisRun)
        .filter(StockAnalysisRun.user_email == user_email)
        .order_by(StockAnalysisRun.created_at.desc(), StockAnalysisRun.id.desc())
        .first()
    )


def delete_stock_analysis_run(db: Session, run: StockAnalysisRun) -> None:
    db.delete(run)
    db.commit()


def serialize_stock_analysis_summary(run: StockAnalysisRun) -> dict[str, Any]:
    return {
        "id": run.id,
        "file_name": run.file_name,
        "total_products": run.total_products,
        "critical_stock": run.critical_stock,
        "warning_stock": run.warning_stock,
        "healthy_stock": run.healthy_stock,
        "restock_needed": run.restock_needed,
        "created_at": run.created_at.isoformat(),
    }


def serialize_stock_analysis_run(run: StockAnalysisRun) -> dict[str, Any]:
    payload = _from_json(run.payload_json, {})
    return {
        **payload,
        **serialize_stock_analysis_summary(run),
        "uploaded_file": run.file_name,
        "saved": True,
        "analysis_id": run.id,
    }
