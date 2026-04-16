from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from core.database import Base
from pydantic import BaseModel
from typing import Optional

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(String, primary_key=True, index=True)
    topic = Column(String)
    difficulty = Column(String)
    group_id = Column(String)
    created_by = Column(String)
    problem_statement = Column(Text)
    testcases = Column(Text)  # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True))

class ChallengeCreate(BaseModel):
    topic: str
    difficulty: str
    group_id: str

class ChallengeOut(BaseModel):
    id: str
    topic: str
    difficulty: str
    group_id: str
    created_by: str
    problem_statement: Optional[str] = None
    end_time: Optional[datetime] = None
    time_remaining: Optional[str] = None