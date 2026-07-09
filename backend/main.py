from pathlib import Path
import shutil

from fastapi import FastAPI, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware

from services.risk_engine import analyze_risk_file
from services.profit_engine import analyze_profit_file
from services.stock_engine import analyze_stock_file

app = FastAPI(title="TradeMind AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "sample_orders.csv"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def build_analysis(file_path: str, limit: int = 20):
    risk = analyze_risk_file(file_path)
    profit = analyze_profit_file(file_path)
    stock = analyze_stock_file(file_path)

    return {
        "risk_summary": risk["summary"],
        "profit_summary": profit["summary"],
        "stock_summary": stock["summary"],
        "risk_orders": risk["orders"][:limit],
        "profit_products": profit["products"][:limit],
        "stock_items": stock["stocks"][:limit],
    }


@app.get("/")
def root():
    return {"message": "TradeMind AI backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/demo-analysis")
def demo_analysis(limit: int = Query(default=20, ge=1, le=100)):
    return build_analysis(str(DATA_FILE), limit)


@app.post("/api/upload-analysis")
async def upload_analysis(
    file: UploadFile = File(...),
    limit: int = Query(default=20, ge=1, le=100),
):
    file_extension = Path(file.filename).suffix.lower()

    if file_extension not in [".csv", ".xlsx"]:
        return {"error": "Only CSV and Excel .xlsx files are supported"}

    saved_path = UPLOAD_DIR / file.filename

    with saved_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = build_analysis(str(saved_path), limit)
    result["uploaded_file"] = file.filename

    return result