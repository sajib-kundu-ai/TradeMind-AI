import pandas as pd


def _safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def analyze_profit_dataframe(df):
    required_columns = ["product_name", "product_category", "amount", "cost_price", "shipping_cost"]

    for column in required_columns:
        if column not in df.columns:
            raise ValueError(f"Missing required column: {column}")

    df = df.copy()

    df["amount"] = df["amount"].apply(_safe_float)
    df["cost_price"] = df["cost_price"].apply(_safe_float)
    df["shipping_cost"] = df["shipping_cost"].apply(_safe_float)

    df["net_profit"] = df["amount"] - df["cost_price"] - df["shipping_cost"]

    df["profit_margin"] = df.apply(
        lambda row: round((row["net_profit"] / row["amount"]) * 100, 2)
        if row["amount"] > 0
        else 0,
        axis=1,
    )

    total_sales = round(df["amount"].sum(), 2)
    total_cost = round(df["cost_price"].sum(), 2)
    total_shipping = round(df["shipping_cost"].sum(), 2)
    net_profit = round(df["net_profit"].sum(), 2)

    profit_margin = round((net_profit / total_sales) * 100, 2) if total_sales > 0 else 0

    product_summary = (
        df.groupby(["product_name", "product_category"], as_index=False)
        .agg(
            total_sales=("amount", "sum"),
            total_cost=("cost_price", "sum"),
            total_shipping=("shipping_cost", "sum"),
            net_profit=("net_profit", "sum"),
        )
    )

    product_summary["profit_margin"] = product_summary.apply(
        lambda row: round((row["net_profit"] / row["total_sales"]) * 100, 2)
        if row["total_sales"] > 0
        else 0,
        axis=1,
    )

    product_summary["status"] = product_summary["profit_margin"].apply(
        lambda margin: "Low Margin" if margin < 15 else "Healthy"
    )

    product_summary = product_summary.sort_values(by="net_profit", ascending=False)

    low_margin_products = product_summary[
        product_summary["status"] == "Low Margin"
    ].to_dict(orient="records")

    return {
        "summary": {
            "total_sales": total_sales,
            "total_cost": total_cost,
            "total_shipping": total_shipping,
            "net_profit": net_profit,
            "profit_margin": profit_margin,
            "total_products": int(product_summary.shape[0]),
            "low_margin_products": int(len(low_margin_products)),
        },
        "products": product_summary.to_dict(orient="records"),
        "low_margin_alerts": low_margin_products,
    }


def analyze_profit_file(file_path):
    if file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    return analyze_profit_dataframe(df)