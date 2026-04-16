from sqlalchemy.orm import Session
from uuid import uuid4
from models.group import Group, GroupCreate
import json

def create_group(db: Session, group_data: GroupCreate, created_by: str) -> Group:
    group_id = str(uuid4())
    db_group = Group(
        id=group_id,
        name=group_data.name,
        description=group_data.description,
        created_by=created_by,
        members=json.dumps([created_by])
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def list_groups(db: Session) -> list[Group]:
    return db.query(Group).all()

def get_group(db: Session, group_id: str) -> Group | None:
    return db.query(Group).filter(Group.id == group_id).first()

def join_group(db: Session, group_id: str, user_id: str) -> dict:
    db_group = db.query(Group).filter(Group.id == group_id).first()
    if db_group:
        members = json.loads(db_group.members)
        if user_id not in members:
            members.append(user_id)
            db_group.members = json.dumps(members)
            db.commit()
    return {"message": "Successfully joined group"}

def get_group_members(db: Session, group_id: str) -> list[str]:
    db_group = db.query(Group).filter(Group.id == group_id).first()
    if db_group:
        return json.loads(db_group.members)
    return []

def delete_group(db: Session, group_id: str) -> bool:
    db_group = db.query(Group).filter(Group.id == group_id).first()
    if db_group:
        db.delete(db_group)
        db.commit()
        return True
    return False