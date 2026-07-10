import json
from typing import Any

from sqlalchemy.orm import Session

try:
    from ..models import AnalysisRun
except ImportError:
    from models import AnalysisRun


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


def get_latest_analysis_run(db: Session, user_email: str) -> AnalysisRun | None:
    return (
        db.query(AnalysisRun)
        .filter(AnalysisRun.user_email == user_email)
        .order_by(AnalysisRun.created_at.desc(), AnalysisRun.id.desc())
        .first()
    )


def delete_analysis_run(db: Session, run: AnalysisRun) -> None:
    db.delete(run)
    db.commit()


def serialize_analysis_summary(run: AnalysisRun) -> dict[str, Any]:
    return {
        "id": run.id,
        "file_name": run.file_name,
        "total_orders": run.total_orders,
        "high_risk_orders": run.high_risk_orders,
        "net_profit": run.net_profit,
        "restock_needed": run.restock_needed,
        "created_at": run.created_at.isoformat(),
    }


def serialize_analysis_run(run: AnalysisRun) -> dict[str, Any]:
    return {
        **serialize_analysis_summary(run),
        "uploaded_file": run.file_name,
        "risk_summary": _from_json(run.risk_summary, {}),
        "profit_summary": _from_json(run.profit_summary, {}),
        "stock_summary": _from_json(run.stock_summary, {}),
        "risk_orders": _from_json(run.risk_orders, []),
        "profit_products": _from_json(run.profit_products, []),
        "stock_items": _from_json(run.stock_items, []),
        "saved": True,
        "analysis_id": run.id,
    }
