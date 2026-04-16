from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Path
from models.challenge import ChallengeCreate, ChallengeOut
from core.security import get_current_user
from services.challenge_service import (
    create_challenge,
    get_challenge_by_id,
    get_previous_challenges,
    delete_challenge,
)
from core.database import get_db
from sqlalchemy.orm import Session

def format_time_remaining(seconds):
    if seconds <= 0:
        return "Expired"
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    if hours > 0:
        return f"{hours} hour{'s' if hours > 1 else ''} {minutes} minute{'s' if minutes != 1 else ''}"
    else:
        return f"{minutes} minute{'s' if minutes != 1 else ''}"

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.post("/", response_model=ChallengeOut)
async def create_challenge_route(
    challenge: ChallengeCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db_challenge = await create_challenge(db, challenge, current_user["username"])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    end_time = db_challenge.created_at + timedelta(hours=8) if db_challenge.created_at else None
    time_remaining = None
    if end_time:
        seconds = max(0, int((end_time - datetime.utcnow()).total_seconds()))
        time_remaining = format_time_remaining(seconds)

    return ChallengeOut(
        id=db_challenge.id,
        topic=db_challenge.topic,
        difficulty=db_challenge.difficulty,
        group_id=db_challenge.group_id,
        created_by=db_challenge.created_by,
        problem_statement=db_challenge.problem_statement,
        end_time=end_time,
        time_remaining=time_remaining
    )

@router.get("/{challenge_id}", response_model=ChallengeOut)
async def get_challenge_by_id_route(
    challenge_id: str = Path(..., title="Challenge ID"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_challenge = get_challenge_by_id(db, challenge_id)
    if not db_challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    end_time = db_challenge.created_at + timedelta(hours=8) if db_challenge.created_at else None
    time_remaining = None
    if end_time:
        seconds = max(0, int((end_time - datetime.utcnow()).total_seconds()))
        time_remaining = format_time_remaining(seconds)

    return ChallengeOut(
        id=db_challenge.id,
        topic=db_challenge.topic,
        difficulty=db_challenge.difficulty,
        group_id=db_challenge.group_id,
        created_by=db_challenge.created_by,
        problem_statement=db_challenge.problem_statement,
        end_time=end_time,
        time_remaining=time_remaining
    )

@router.get("/group/{group_id}/previous")
async def get_previous_challenges_route(
    group_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenges = get_previous_challenges(db, group_id)
    result = []
    for c in challenges:
        end_time = c.created_at + timedelta(hours=8) if c.created_at else None
        time_remaining = None
        if end_time:
            seconds = max(0, int((end_time - datetime.utcnow()).total_seconds()))
            time_remaining = format_time_remaining(seconds)

        result.append({
            "id": c.id,
            "topic": c.topic,
            "difficulty": c.difficulty,
            "group_id": c.group_id,
            "created_by": c.created_by,
            "problem_statement": c.problem_statement,
            "end_time": end_time,
            "time_remaining": time_remaining,
        })

    return result

@router.delete("/{challenge_id}")
async def delete_challenge_route(
    challenge_id: str = Path(..., title="Challenge ID"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = delete_challenge(db, challenge_id, current_user["id"])
    if not success:
        raise HTTPException(status_code=403, detail="You don't have permission to delete this challenge")
    return {"message": "Challenge deleted successfully"}