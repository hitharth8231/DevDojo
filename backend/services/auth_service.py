from sqlalchemy.orm import Session
from uuid import uuid4
from models.user import User, UserCreate, UserUpdate
from utils.password_utils import hash_password
from datetime import datetime

def create_user(db: Session, user: UserCreate) -> User:
    user_id = str(uuid4())
    hashed_pw = hash_password(user.password)
    db_user = User(
        id=user_id,
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

def update_user_profile(db: Session, user_id: str, user_update: UserUpdate) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.github_username = user_update.github_username
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user_by_id(db: Session, user_id: str) -> bool:
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False