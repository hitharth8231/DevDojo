from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.sql import func
from core.database import Base
from pydantic import BaseModel
from typing import List

class Group(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    created_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    members = Column(String)  # JSON string of list

class GroupCreate(BaseModel):
    name: str
    description: str

class GroupOut(BaseModel):
    id: str
    name: str
    description: str
    created_by: str
    members: List[str]