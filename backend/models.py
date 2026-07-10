from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

try:
    from .database import Base
except ImportError:
    from database import Base


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)
    file_name = Column(String, nullable=False)
    total_orders = Column(Integer, nullable=False, default=0)
    high_risk_orders = Column(Integer, nullable=False, default=0)
    net_profit = Column(Float, nullable=False, default=0.0)
    restock_needed = Column(Integer, nullable=False, default=0)
    risk_summary = Column(Text, nullable=False)
    profit_summary = Column(Text, nullable=False)
    stock_summary = Column(Text, nullable=False)
    risk_orders = Column(Text, nullable=False)
    profit_products = Column(Text, nullable=False)
    stock_items = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
