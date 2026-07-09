import pandas as pd


def _safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _stock_status(days_left):
    if days_left <= 3:
        return "Critical"
    if days_left <= 7:
        return "Warning"
    return "Healthy"


def _suggestion(status):
    if status == "Critical":
        return "Restock immediately"
    if status == "Warning":
        return "Restock soon"
    return "Stock okay"


def analyze_stock_dataframe(df):
    required_columns = ["product_name", "product_category", "current_stock", "avg_daily_sales"]

    for column in required_columns:
        if column not in df.columns:
            raise ValueError(f"Missing required column: {column}")

    df = df.copy()

    df["current_stock"] = df["current_stock"].apply(_safe_float)
    df["avg_daily_sales"] = df["avg_daily_sales"].apply(_safe_float)

    product_stock = (
        df.groupby(["product_name", "product_category"], as_index=False)
        .agg(
            current_stock=("current_stock", "max"),
            avg_daily_sales=("avg_daily_sales", "mean"),
        )
    )

    product_stock["days_left"] = product_stock.apply(
        lambda row: round(row["current_stock"] / row["avg_daily_sales"], 2)
        if row["avg_daily_sales"] > 0
        else 999,
        axis=1,
    )

    product_stock["status"] = product_stock["days_left"].apply(_stock_status)
    product_stock["suggestion"] = product_stock["status"].apply(_suggestion)

    product_stock["recommended_restock"] = product_stock.apply(
        lambda row: int(row["avg_daily_sales"] * 14)
        if row["status"] in ["Critical", "Warning"]
        else 0,
        axis=1,
    )

    total_products = int(product_stock.shape[0])
    critical_stock = int(len(product_stock[product_stock["status"] == "Critical"]))
    warning_stock = int(len(product_stock[product_stock["status"] == "Warning"]))
    healthy_stock = int(len(product_stock[product_stock["status"] == "Healthy"]))

    product_stock = product_stock.sort_values(by="days_left", ascending=True)

    return {
        "summary": {
            "total_products": total_products,
            "critical_stock": critical_stock,
            "warning_stock": warning_stock,
            "healthy_stock": healthy_stock,
            "restock_needed": critical_stock + warning_stock,
        },
        "stocks": product_stock.to_dict(orient="records"),
    }


def analyze_stock_file(file_path):
    if file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    return analyze_stock_dataframe(df)