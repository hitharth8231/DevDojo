from fastapi import APIRouter, Depends, HTTPException
from core.security import get_current_user
from services.challenge_service import get_testcases
from core.database import get_db
from sqlalchemy.orm import Session
import json

router = APIRouter(prefix="/testcases", tags=["TestCases"])

@router.get("/{challenge_id}", response_model=dict)
async def get_testcases_route(
    challenge_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    testcases_str = get_testcases(db, challenge_id)
    if not testcases_str:
        raise HTTPException(status_code=404, detail="Test cases not found for this challenge.")

    try:
        parsed_testcases = json.loads(testcases_str)
        return {
            "challenge_id": challenge_id,
            "testcases": parsed_testcases
        }
    except (json.JSONDecodeError, TypeError):
        return {
            "challenge_id": challenge_id,
            "testcases": testcases_str
        }