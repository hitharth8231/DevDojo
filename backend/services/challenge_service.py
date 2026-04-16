from sqlalchemy.orm import Session
from uuid import uuid4
from models.challenge import Challenge, ChallengeCreate
from agents.agent_manager import generate_question
import json


async def create_challenge(db: Session, challenge: ChallengeCreate, created_by: str) -> Challenge:
    challenge_id = str(uuid4())

    # 🔹 Call AI agent (Dify / LLM)
    question_data = await generate_question({
        "topic": challenge.topic,
        "difficulty": challenge.difficulty,
        "step_wise_description": "",  # required for Agent 2
        "user_id": created_by
    })

    # 🔒 Safe defaults
    problem_statement = ""
    testcases = []

    # 🔍 Safe parsing (handles all formats)
    if question_data:
        try:
            # generate_question returns a clean dict
            problem_statement = question_data.get("problem_statement", "")
            testcases = question_data.get("testcases", [])

        except Exception as e:
            print("❌ Error parsing question_data:", e)
            problem_statement = ""
            testcases = []

    # If agent failed to generate problem statement, provide fallback
    if not problem_statement.strip():
        problem_statement = f"Write a {challenge.difficulty} level solution for: {challenge.topic}"
        print("⚠️ Agent failed, using fallback problem statement")

    # Convert testcases → JSON string
    testcases_json = json.dumps(testcases)

    # 🗄️ Save to DB
    from datetime import datetime, timedelta
    db_challenge = Challenge(
        id=challenge_id,
        topic=challenge.topic,
        difficulty=challenge.difficulty,
        group_id=challenge.group_id,
        created_by=created_by,
        problem_statement=problem_statement,
        testcases=testcases_json,
        end_time=datetime.utcnow() + timedelta(hours=8)
    )

    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)

    return db_challenge


# 🔍 Get single challenge
def get_challenge_by_id(db: Session, challenge_id: str) -> Challenge | None:
    return db.query(Challenge).filter(Challenge.id == challenge_id).first()


# 📜 Get all previous challenges of a group
def get_previous_challenges(db: Session, group_id: str) -> list[Challenge]:
    return db.query(Challenge).filter(Challenge.group_id == group_id).all()


# 🧪 Get testcases
def get_testcases(db: Session, challenge_id: str) -> str | None:
    db_challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if db_challenge:
        return db_challenge.testcases
    return None


# 🗑️ Delete challenge
def delete_challenge(db: Session, challenge_id: str, user_id: str) -> bool:
    from models.group import Group  # Import here to avoid circular imports
    from models.submission import Submission  # Import here to avoid circular imports
    
    # Get the challenge
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        return False
    
    # Check if user is the group creator
    group = db.query(Group).filter(Group.id == challenge.group_id).first()
    if not group or group.created_by != user_id:
        return False
    
    # Delete related submissions first
    db.query(Submission).filter(Submission.challenge_id == challenge_id).delete()
    
    # Delete the challenge
    db.delete(challenge)
    db.commit()
    return True