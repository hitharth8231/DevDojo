import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BACKEND_DIR = Path(__file__).resolve().parents[1]


def resolve_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        if database_url.startswith("postgres://"):
            return database_url.replace("postgres://", "postgresql://", 1)
        return database_url

    sqlite_path = BACKEND_DIR / "dojo.db"
    return f"sqlite:///{sqlite_path.as_posix()}"


# Application Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey123")
# Use one stable SQLite file for local development, regardless of the launch directory.
DATABASE_URL = resolve_database_url()
