import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.engine import make_url

# --------------------------------------------------
# Load environment variables from backend/.env
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"

if not ENV_FILE.exists():
    raise FileNotFoundError(
        f".env file not found at: {ENV_FILE}"
    )

# Prioritize backend/.env over existing environment variables
load_dotenv(dotenv_path=ENV_FILE, override=True)

# --------------------------------------------------
# PostgreSQL Configuration
# --------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is missing. Check your backend/.env file."
    )

# Validate URL and display database name only
database_config = make_url(DATABASE_URL)

print(f"Database configured: {database_config.database}")

# --------------------------------------------------
# SQLAlchemy Engine
# --------------------------------------------------

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
)

# --------------------------------------------------
# Database Session
# --------------------------------------------------

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

# --------------------------------------------------
# Base Model
# --------------------------------------------------

class Base(DeclarativeBase):
    pass

# --------------------------------------------------
# Database Dependency
# --------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()