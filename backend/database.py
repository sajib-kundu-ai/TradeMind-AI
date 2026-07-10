from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'trademind.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_analysis_metadata_columns()


def _ensure_analysis_metadata_columns() -> None:
    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(analysis_runs)")
        }
        if "reanalyzed_at" not in columns:
            connection.exec_driver_sql("ALTER TABLE analysis_runs ADD COLUMN reanalyzed_at VARCHAR")
        if "analysis_version" not in columns:
            connection.exec_driver_sql("ALTER TABLE analysis_runs ADD COLUMN analysis_version VARCHAR")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
