from sqlalchemy.orm import Session
from uuid import uuid4
from models.submission import Submission, SubmissionOut
from agents.agent_manager import evaluate_code
from fastapi import HTTPException
import json

def get_my_submissions(db: Session, user_id: str) -> list[Submission]:
    return db.query(Submission).filter(Submission.user_id == user_id).all()

async def submit_code(db: Session, user_id: str, challenge_id: str, code: str) -> tuple[Submission, int]:
    # Check if challenge exists
    from services.challenge_service import get_challenge_by_id
    challenge = get_challenge_by_id(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # TODO: Check end time when database is migrated
    # if challenge.end_time and datetime.utcnow() > challenge.end_time:
    #     raise HTTPException(status_code=400, detail="Challenge has ended")
    
    # Get testcases and challenge text
    from services.challenge_service import get_testcases, get_challenge_by_id
    testcases_str = get_testcases(db, challenge_id)
    testcases = json.loads(testcases_str) if testcases_str else []
    challenge = get_challenge_by_id(db, challenge_id)
    challenge_description = challenge.problem_statement if challenge else ""
    
    # Evaluate
    result = await evaluate_code(code, testcases, challenge_description, user_id)
    score = result.get("score", 0.0)
    xp = result.get("xp", 0)
    feedback = result.get("feedback", "")
    
    submission_id = str(uuid4())
    db_submission = Submission(
        id=submission_id,
        challenge_id=challenge_id,
        user_id=user_id,
        code=code,
        status="completed",
        score=score,
        xp=xp,
        feedback=feedback
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    # Update leaderboard with actual xp from evaluation
    update_leaderboard(db, user_id, challenge_id, xp, current_submission_id=submission_id)
    
    return db_submission, xp

def update_leaderboard(db: Session, user_id: str, challenge_id: str, xp: int, current_submission_id: str | None = None):

    from models.challenge import Challenge
    from models.user import User
    from models.leaderboard import Leaderboard
    from models.submission import Submission

    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    user = db.query(User).filter(User.id == user_id).first()

    if not challenge:
        print("❌ Challenge not found")
        return

    if not user:
        print("❌ User not found")
        return

    group_id = challenge.group_id

    print("=== LEADERBOARD UPDATE ===")
    print("GROUP:", group_id)
    print("USER:", user_id)
    print("NEW XP:", xp)

    # 🔥 find leaderboard entry
    entry = db.query(Leaderboard).filter(
        Leaderboard.group_id == group_id,
        Leaderboard.user_id == user_id
    ).first()

    # 🔥 get user's BEST previous submission for this challenge (by XP, not score)
    previous_best_query = db.query(Submission).filter(
        Submission.user_id == user_id,
        Submission.challenge_id == challenge_id
    )
    if current_submission_id:
        previous_best_query = previous_best_query.filter(Submission.id != current_submission_id)

    previous_best = previous_best_query.order_by(Submission.xp.desc()).first()

    old_xp = previous_best.xp if previous_best and previous_best.xp is not None else 0

    print("OLD XP (this challenge):", old_xp)

    # 🔥 calculate difference - only add if new XP is higher than previous best
    xp_to_add = max(0, xp - old_xp)

    print("XP TO ADD:", xp_to_add)

    if entry:
        print("OLD TOTAL XP:", entry.xp)
        entry.xp += xp_to_add
        print("NEW TOTAL XP:", entry.xp)
    else:
        print("CREATING NEW ENTRY")
        entry = Leaderboard(
            id=f"{group_id}_{user_id}",
            group_id=group_id,
            user_id=user_id,
            username=user.username,
            xp=xp  # first time → full xp
        )
        db.add(entry)

    db.commit()
