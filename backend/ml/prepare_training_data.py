from pathlib import Path

import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]
SOURCE_FILE = (
    BASE_DIR
    / "data"
    / "raw"
    / "kaggle"
    / "archive (1)"
    / "ecommerce_returns_synthetic_data.csv"
)
OUTPUT_FILE = BASE_DIR / "data" / "training" / "training_orders.csv"
RANDOM_STATE = 42


PRODUCT_NAMES = {
    "Books": ["Paperback Book", "Study Guide", "Notebook Set"],
    "Clothing": ["Casual Shirt", "Denim Jacket", "Cotton Hoodie"],
    "Electronics": ["Wireless Earbuds", "Smart Watch", "Bluetooth Speaker"],
    "Home": ["Kitchen Organizer", "Table Lamp", "Storage Basket"],
    "Toys": ["Puzzle Set", "Building Blocks", "Remote Car"],
}

RISKY_ORDER_HOUR_WEIGHTS = np.array(
    [0.07, 0.07, 0.06, 0.05, 0.02, 0.02, 0.025, 0.025, 0.03, 0.035, 0.04, 0.04, 0.04, 0.04, 0.045, 0.045, 0.05, 0.05, 0.055, 0.055, 0.055, 0.055, 0.065, 0.07],
    dtype=float,
)
HEALTHY_ORDER_HOUR_WEIGHTS = np.array(
    [0.015, 0.01, 0.01, 0.005, 0.005, 0.01, 0.025, 0.04, 0.055, 0.06, 0.065, 0.065, 0.07, 0.07, 0.07, 0.07, 0.065, 0.065, 0.06, 0.055, 0.045, 0.035, 0.025, 0.015],
    dtype=float,
)
RISKY_ORDER_HOUR_WEIGHTS = RISKY_ORDER_HOUR_WEIGHTS / RISKY_ORDER_HOUR_WEIGHTS.sum()
HEALTHY_ORDER_HOUR_WEIGHTS = HEALTHY_ORDER_HOUR_WEIGHTS / HEALTHY_ORDER_HOUR_WEIGHTS.sum()


def _map_payment_type(value):
    value = str(value).strip().lower()
    if value in {"cash on delivery", "cod"}:
        return "COD"
    if value in {"credit card", "debit card", "paypal", "bank transfer"}:
        return "Prepaid"
    return "Prepaid"


def _choice_by_risk(rng, is_risky, risky_probability, healthy_probability):
    probability = risky_probability if is_risky else healthy_probability
    return "Yes" if rng.random() < probability else "No"


def prepare_training_data(source_file=SOURCE_FILE, output_file=OUTPUT_FILE):
    rng = np.random.default_rng(RANDOM_STATE)
    df = pd.read_csv(source_file)
    output = pd.DataFrame()

    is_risky = df["Return_Status"].astype(str).str.strip().eq("Returned").astype(int)
    amount = pd.to_numeric(df["Product_Price"], errors="coerce").fillna(0)
    quantity = pd.to_numeric(df["Order_Quantity"], errors="coerce").fillna(1).astype(int)
    discount = pd.to_numeric(df["Discount_Applied"], errors="coerce").fillna(0)
    categories = df["Product_Category"].fillna("General").astype(str)

    output["order_id"] = df["Order_ID"]
    output["order_date"] = df["Order_Date"]
    output["customer_id"] = df["User_ID"]
    output["city"] = df["User_Location"].fillna("Unknown")
    output["product_category"] = categories
    output["amount"] = (amount * quantity).round(2)
    output["quantity"] = quantity.clip(lower=1)
    output["payment_type"] = df["Payment_Method"].apply(_map_payment_type)
    output["shipping_speed"] = df["Shipping_Method"].fillna("Standard")
    output["discount_amount"] = discount.round(2)
    output["is_risky"] = is_risky

    output["product_name"] = [
        rng.choice(PRODUCT_NAMES.get(category, ["General Product"]))
        for category in categories
    ]
    output["cost_price"] = (output["amount"] * rng.uniform(0.48, 0.72, len(output))).round(2)
    output["shipping_cost"] = rng.uniform(45, 380, len(output)).round(2)
    output["customer_type"] = np.where(
        is_risky.eq(1),
        rng.choice(["New", "Returning"], len(output), p=[0.58, 0.42]),
        rng.choice(["New", "Returning"], len(output), p=[0.22, 0.78]),
    )
    output["phone_verified"] = [
        _choice_by_risk(rng, bool(risky), 0.72, 0.96) for risky in is_risky
    ]
    output["email_verified"] = [
        _choice_by_risk(rng, bool(risky), 0.78, 0.95) for risky in is_risky
    ]
    output["address_complete"] = [
        _choice_by_risk(rng, bool(risky), 0.74, 0.97) for risky in is_risky
    ]
    output["distance_km"] = np.where(
        is_risky.eq(1),
        rng.integers(25, 125, len(output)),
        rng.integers(2, 65, len(output)),
    )
    output["previous_orders"] = np.where(
        output["customer_type"].eq("New"),
        rng.integers(0, 2, len(output)),
        rng.integers(2, 36, len(output)),
    )
    output["previous_returns"] = np.where(
        is_risky.eq(1),
        rng.choice([0, 1, 2, 3, 4], len(output), p=[0.28, 0.38, 0.22, 0.09, 0.03]),
        rng.choice([0, 1, 2], len(output), p=[0.88, 0.10, 0.02]),
    )
    output["order_hour"] = np.where(
        is_risky.eq(1),
        rng.choice(list(range(24)), len(output), p=RISKY_ORDER_HOUR_WEIGHTS),
        rng.choice(list(range(24)), len(output), p=HEALTHY_ORDER_HOUR_WEIGHTS),
    )
    output["coupon_used"] = [
        _choice_by_risk(rng, bool(risky), 0.68, 0.34) for risky in is_risky
    ]
    output["account_age_days"] = np.where(
        is_risky.eq(1),
        rng.integers(1, 365, len(output)),
        rng.integers(60, 1600, len(output)),
    )
    output["current_stock"] = rng.integers(0, 180, len(output))
    output["avg_daily_sales"] = rng.integers(1, 24, len(output))
    output["status"] = np.where(is_risky.eq(1), "Returned", "Success")

    ordered_columns = [
        "order_id",
        "order_date",
        "customer_id",
        "city",
        "product_name",
        "product_category",
        "quantity",
        "payment_type",
        "shipping_speed",
        "amount",
        "discount_amount",
        "cost_price",
        "shipping_cost",
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
        "status",
        "is_risky",
    ]
    output = output[ordered_columns]

    output_file.parent.mkdir(parents=True, exist_ok=True)
    output.to_csv(output_file, index=False)
    return output_file


if __name__ == "__main__":
    saved_file = prepare_training_data()
    print(f"Saved training data to {saved_file}")
