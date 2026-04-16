from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from core.database import Base
from pydantic import BaseModel
from typing import Optional

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    github_username = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserUpdate(BaseModel):
    github_username: str

class UserOut(BaseModel):
    id: str
    username: str
    email: str
    github_username: Optional[str] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None