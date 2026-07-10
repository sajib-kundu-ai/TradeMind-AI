from math import ceil
from pathlib import Path
from typing import Any
from datetime import datetime, timezone

import pandas as pd


REQUIRED_COLUMNS = ["product_name", "current_stock", "avg_daily_sales"]
OPTIONAL_COLUMNS = [
    "product_category",
    "cost_price",
    "selling_price",
    "reorder_level",
    "lead_time_days",
    "supplier_name",
]
TARGET_DAYS = 14


def _safe_float(value):
    try:
        number = float(value)
        if pd.isna(number):
            return 0.0
        return number
    except (TypeError, ValueError):
        return 0.0


def _safe_text(value, default=""):
    if value is None or pd.isna(value):
        return default
    text = str(value).strip()
    return text or default


def _stock_status(avg_daily_sales, days_left):
    if avg_daily_sales <= 0:
        return "No Sales Data"
    if days_left <= 3:
        return "Critical"
    if days_left <= 7:
        return "Warning"
    return "Healthy"


def _suggestion(status):
    if status == "No Sales Data":
        return "Add sales data for better forecast"
    if status == "Critical":
        return "Restock immediately"
    if status == "Warning":
        return "Restock soon"
    return "Stock okay"


def _recommended_restock(current_stock, avg_daily_sales, reorder_level=0):
    base_target = ceil(avg_daily_sales * TARGET_DAYS - current_stock)
    reorder_target = ceil(reorder_level - current_stock) if reorder_level > 0 else 0
    return int(max(0, base_target, reorder_target))


def _validate_columns(df):
    columns = set(df.columns)
    missing = [column for column in REQUIRED_COLUMNS if column not in columns]
    if missing:
        raise ValueError(
            "Missing required stock columns: product_name, current_stock, avg_daily_sales"
        )


def normalize_product_key(item: dict[str, Any]) -> str:
    product_name = _safe_text(item.get("product_name"), "Unknown Product").lower()
    product_category = _safe_text(item.get("product_category"), "General").lower()
    return f"{product_name}|{product_category}"


def merge_stock_records(
    existing_items: list[dict[str, Any]],
    new_items: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    merged_by_key: dict[str, dict[str, Any]] = {}
    existing_keys: set[str] = set()

    for item in existing_items or []:
        if not isinstance(item, dict):
            continue
        key = normalize_product_key(item)
        merged_by_key[key] = dict(item)
        existing_keys.add(key)

    added_keys: set[str] = set()
    updated_keys: set[str] = set()
    for item in new_items or []:
        if not isinstance(item, dict):
            continue
        key = normalize_product_key(item)
        if key in existing_keys:
            updated_keys.add(key)
            added_keys.discard(key)
        else:
            added_keys.add(key)
        merged_by_key[key] = dict(item)

    merge_stats = {
        "merged": True,
        "previous_product_count": len(existing_keys),
        "new_upload_count": len(new_items or []),
        "added_products": len(added_keys),
        "updated_products": len(updated_keys),
        "final_product_count": len(merged_by_key),
        "merged_at": datetime.now(timezone.utc).isoformat(),
    }
    return list(merged_by_key.values()), merge_stats


def analyze_stock_records(records: list[dict[str, Any]]):
    df = pd.DataFrame.from_records(records or [])
    return analyze_stock_dataframe(df)


def analyze_stock_dataframe(df):
    if df is None or df.empty:
        empty_summary = {
            "total_products": 0,
            "critical_stock": 0,
            "warning_stock": 0,
            "healthy_stock": 0,
            "no_sales_data": 0,
            "restock_needed": 0,
        }
        return {
            "file_name": None,
            "stock_summary": empty_summary,
            "stock_items": [],
            "stock_suggestions": [],
            "summary": empty_summary,
            "stocks": [],
        }

    df = df.copy()
    df.columns = [str(column).strip() for column in df.columns]
    _validate_columns(df)
    for column in OPTIONAL_COLUMNS:
        if column not in df.columns:
            df[column] = "" if column in {"product_category", "supplier_name"} else 0

    df["product_name"] = df["product_name"].apply(lambda value: _safe_text(value, "Unknown Product"))
    df["product_category"] = df["product_category"].apply(lambda value: _safe_text(value, "General"))
    df["supplier_name"] = df["supplier_name"].apply(_safe_text)
    df["current_stock"] = df["current_stock"].apply(_safe_float)
    df["avg_daily_sales"] = df["avg_daily_sales"].apply(_safe_float)
    df["cost_price"] = df["cost_price"].apply(_safe_float)
    df["selling_price"] = df["selling_price"].apply(_safe_float)
    df["reorder_level"] = df["reorder_level"].apply(_safe_float)
    df["lead_time_days"] = df["lead_time_days"].apply(_safe_float)

    product_stock = (
        df.groupby(["product_name", "product_category"], as_index=False)
        .agg(
            current_stock=("current_stock", "max"),
            avg_daily_sales=("avg_daily_sales", "mean"),
            cost_price=("cost_price", "mean"),
            selling_price=("selling_price", "mean"),
            reorder_level=("reorder_level", "max"),
            lead_time_days=("lead_time_days", "max"),
            supplier_name=("supplier_name", "first"),
        )
    )

    product_stock["days_left"] = product_stock.apply(
        lambda row: round(row["current_stock"] / row["avg_daily_sales"], 2)
        if row["avg_daily_sales"] > 0
        else None,
        axis=1,
    )

    product_stock["status"] = product_stock.apply(
        lambda row: _stock_status(row["avg_daily_sales"], row["days_left"] or 0),
        axis=1,
    )
    product_stock["suggestion"] = product_stock["status"].apply(_suggestion)

    product_stock["recommended_restock"] = product_stock.apply(
        lambda row: (
            0
            if row["avg_daily_sales"] <= 0
            else _recommended_restock(
                row["current_stock"],
                row["avg_daily_sales"],
                row["reorder_level"],
            )
        ),
        axis=1,
    )
    product_stock["needs_restock"] = product_stock.apply(
        lambda row: row["status"] in {"Critical", "Warning"}
        or (row["reorder_level"] > 0 and row["current_stock"] <= row["reorder_level"]),
        axis=1,
    )

    total_products = int(product_stock.shape[0])
    critical_stock = int(len(product_stock[product_stock["status"] == "Critical"]))
    warning_stock = int(len(product_stock[product_stock["status"] == "Warning"]))
    healthy_stock = int(len(product_stock[product_stock["status"] == "Healthy"]))
    no_sales_data = int(len(product_stock[product_stock["status"] == "No Sales Data"]))
    restock_needed = int(len(product_stock[product_stock["needs_restock"]]))

    product_stock = product_stock.sort_values(
        by=["days_left", "recommended_restock"],
        ascending=[True, False],
        na_position="last",
    ).drop(columns=["needs_restock"])

    stock_summary = {
        "total_products": total_products,
        "critical_stock": critical_stock,
        "warning_stock": warning_stock,
        "healthy_stock": healthy_stock,
        "no_sales_data": no_sales_data,
        "restock_needed": restock_needed,
    }
    product_stock = product_stock.astype(object).where(pd.notna(product_stock), None)
    stock_items = product_stock.to_dict(orient="records")
    stock_suggestions = [
        f"{item['product_name']}: {item['suggestion']}"
        for item in stock_items
        if item.get("status") in {"Critical", "Warning", "No Sales Data"}
    ]

    return {
        "file_name": None,
        "stock_summary": stock_summary,
        "stock_items": stock_items,
        "stock_suggestions": stock_suggestions,
        "summary": stock_summary,
        "stocks": stock_items,
    }


def read_stock_file_records(file_path):
    file_path = str(file_path)
    suffix = Path(file_path).suffix.lower()
    if suffix == ".xlsx":
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)
    df.columns = [str(column).strip() for column in df.columns]
    _validate_columns(df)
    return df.to_dict(orient="records")


def analyze_stock_file(file_path):
    records = read_stock_file_records(file_path)
    analysis = analyze_stock_records(records)
    analysis["file_name"] = Path(file_path).name
    return analysis
