from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.group import GroupCreate, GroupOut
from core.security import get_current_user
from services.group_service import (
    create_group,
    list_groups,
    get_group,
    join_group,
    get_group_members,
    delete_group
)
from core.database import get_db
from sqlalchemy.orm import Session
import json

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post("/", response_model=GroupOut)
async def create_group_route(
    group: GroupCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_group = create_group(db, group, current_user["username"])
    return GroupOut(
        id=db_group.id,
        name=db_group.name,
        description=db_group.description,
        created_by=db_group.created_by,
        members=json.loads(db_group.members)
    )

@router.get("/", response_model=List[GroupOut])
async def list_groups_route(db: Session = Depends(get_db)):
    groups = list_groups(db)
    return [
        GroupOut(
            id=g.id,
            name=g.name,
            description=g.description,
            created_by=g.created_by,
            members=json.loads(g.members)
        ) for g in groups
    ]

@router.get("/{group_id}", response_model=GroupOut)
async def get_group_route(group_id: str, db: Session = Depends(get_db)):
    db_group = get_group(db, group_id)
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    return GroupOut(
        id=db_group.id,
        name=db_group.name,
        description=db_group.description,
        created_by=db_group.created_by,
        members=json.loads(db_group.members)
    )

@router.post("/{group_id}/join")
async def join_group_route(
    group_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return join_group(db, group_id, current_user["id"])

@router.get("/{group_id}/members")
async def get_group_members_route(group_id: str, db: Session = Depends(get_db)):
    members = get_group_members(db, group_id)
    return {"group_id": group_id, "members": members}

@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group_route(
    group_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = delete_group(db, group_id)
    if not success:
        raise HTTPException(status_code=404, detail="Group not found")