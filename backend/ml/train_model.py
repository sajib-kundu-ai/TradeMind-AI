import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parents[1]
TRAINING_FILE = BASE_DIR / "data" / "training" / "training_orders.csv"
MODEL_FILE = BASE_DIR / "ml" / "risk_model.joblib"
METRICS_FILE = BASE_DIR / "ml" / "model_metrics.json"
FEATURES_FILE = BASE_DIR / "ml" / "feature_columns.json"
RANDOM_STATE = 42

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

CATEGORICAL_COLUMNS = [
    "payment_type",
    "product_category",
    "customer_type",
    "phone_verified",
    "email_verified",
    "address_complete",
    "coupon_used",
    "shipping_speed",
]


def _top_features(pipeline, limit=15):
    model = pipeline.named_steps["model"]
    preprocessor = pipeline.named_steps["preprocessor"]
    try:
        feature_names = preprocessor.get_feature_names_out()
    except Exception:
        return []

    importances = getattr(model, "feature_importances_", [])
    ranked = sorted(
        zip(feature_names, importances),
        key=lambda item: float(item[1]),
        reverse=True,
    )
    return [
        {"feature": str(feature), "importance": round(float(importance), 6)}
        for feature, importance in ranked[:limit]
    ]


def train_model(training_file=TRAINING_FILE):
    df = pd.read_csv(training_file)
    missing = [column for column in FEATURE_COLUMNS + ["is_risky"] if column not in df.columns]
    if missing:
        raise ValueError(f"Missing required training columns: {', '.join(missing)}")

    x = df[FEATURE_COLUMNS].copy()
    y = df["is_risky"].astype(int)

    numeric_columns = [column for column in FEATURE_COLUMNS if column not in CATEGORICAL_COLUMNS]
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_COLUMNS),
            ("numeric", "passthrough", numeric_columns),
        ]
    )
    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=240,
                    min_samples_leaf=2,
                    class_weight="balanced",
                    random_state=RANDOM_STATE,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y,
    )
    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "precision": round(float(precision_score(y_test, predictions, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, predictions, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, predictions, zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(y_test, predictions).tolist(),
        "training_rows": int(len(df)),
        "test_rows": int(len(x_test)),
        "target_distribution": {
            "not_returned": int((y == 0).sum()),
            "returned": int((y == 1).sum()),
        },
        "top_features": _top_features(pipeline),
    }

    MODEL_FILE.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_FILE)
    METRICS_FILE.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    FEATURES_FILE.write_text(json.dumps(FEATURE_COLUMNS, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    model_metrics = train_model()
    print(json.dumps(model_metrics, indent=2))
