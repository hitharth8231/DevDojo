import os
from dotenv import load_dotenv

load_dotenv()

# Application Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey123")
# Use SQLite for development (no Docker required)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dojo.db")