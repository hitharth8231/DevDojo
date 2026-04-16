from fastapi import APIRouter, Depends
from typing import List
from core.security import get_current_user
from models.leaderboard import LeaderboardEntry, GroupLeaderboardEntry
from services.leaderboard_service import (
    get_global_leaderboard,
    get_group_leaderboard,
)
from core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/global", response_model=List[LeaderboardEntry])
async def get_global_leaderboard_route(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_global_leaderboard(db)

@router.get("/group/{group_id}", response_model=List[GroupLeaderboardEntry])
async def get_group_leaderboard_route(
    group_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_group_leaderboard(db, group_id)