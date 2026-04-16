from sqlalchemy import Column, String, Integer
from core.database import Base
from pydantic import BaseModel

class Leaderboard(Base):
    __tablename__ = "leaderboard"

    id = Column(String, primary_key=True)  # group_id + user_id
    group_id = Column(String)
    user_id = Column(String)
    username = Column(String)
    xp = Column(Integer, default=0)

class LeaderboardEntry(BaseModel):
    user_id: str
    username: str
    xp: int

class GroupLeaderboardEntry(BaseModel):
    user_id: str
    username: str
    xp: int
    group_id: str