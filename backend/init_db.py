from sqlalchemy import inspect, text

from core.database import Base, engine
from models import user, group, challenge, submission, leaderboard

def ensure_submission_xp_column():
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("submissions")}
    if "xp" in columns:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE submissions ADD COLUMN xp INTEGER"))
    print("Added submissions.xp column.")

def ensure_challenge_end_time_column():
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("challenges")}
    if "end_time" in columns:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE challenges ADD COLUMN end_time DATETIME"))
    print("Added challenges.end_time column.")

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    ensure_submission_xp_column()
    ensure_challenge_end_time_column()
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_tables()
