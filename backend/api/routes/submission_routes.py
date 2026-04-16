from fastapi import APIRouter, Depends, HTTPException
from models.submission import SubmissionOut
from core.security import get_current_user
from services.submission_service import get_my_submissions, submit_code
from core.database import get_db
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

class SubmitRequest(BaseModel):
    user_id: str
    challenge_id: str
    code: str

router = APIRouter(prefix="/submissions", tags=["Submissions"])

@router.post("/submit")
async def submit_code_route(
    request: SubmitRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if request.user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot submit for another user")
    
    # Check if challenge has expired
    from services.challenge_service import get_challenge_by_id
    challenge = get_challenge_by_id(db, request.challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    if challenge.end_time and datetime.utcnow() > challenge.end_time:
        raise HTTPException(status_code=400, detail="Challenge has expired")
    
    submission, xp = await submit_code(db, request.user_id, request.challenge_id, request.code)
    return {
        "id": submission.id,
        "challenge_id": submission.challenge_id,
        "user_id": submission.user_id,
        "status": submission.status,
        "score": submission.score,
        "xp": xp,
        "feedback": submission.feedback
    }

@router.get("/", response_model=list[SubmissionOut])
async def get_my_submissions_route(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    submissions = get_my_submissions(db, current_user["id"])
    return [
        SubmissionOut(
            id=s.id,
            challenge_id=s.challenge_id,
            user_id=s.user_id,
            code=s.code,
            status=s.status,
            score=s.score,
            xp=s.xp,
            feedback=s.feedback
        ) for s in submissions
    ]
