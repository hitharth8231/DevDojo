from sqlalchemy import Column, String, DateTime, Text, Float, Integer
from sqlalchemy.sql import func
from core.database import Base
from pydantic import BaseModel
from typing import Optional

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, index=True)
    challenge_id = Column(String)
    user_id = Column(String)
    code = Column(Text)
    status = Column(String, default="pending")
    score = Column(Float, nullable=True)
    xp = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SubmissionOut(BaseModel):
    id: str
    challenge_id: str
    user_id: str
    code: str
    status: str
    score: Optional[float] = None
    xp: Optional[int] = None
    feedback: Optional[str] = None
