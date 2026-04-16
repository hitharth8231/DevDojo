from sqlalchemy.orm import Session
from models.leaderboard import Leaderboard, LeaderboardEntry, GroupLeaderboardEntry
from collections import defaultdict


def get_global_leaderboard(db: Session) -> list[LeaderboardEntry]:
    entries = db.query(Leaderboard).all()

    user_xp = defaultdict(int)
    user_names = {}

    for entry in entries:
        user_xp[entry.user_id] += entry.xp
        user_names[entry.user_id] = entry.username

    leaderboard = [
        LeaderboardEntry(
            user_id=user_id,
            username=user_names[user_id],
            xp=xp
        )
        for user_id, xp in user_xp.items()
    ]

    return sorted(leaderboard, key=lambda x: x.xp, reverse=True)


def get_group_leaderboard(db: Session, group_id: str) -> list[GroupLeaderboardEntry]:
    entries = db.query(Leaderboard).filter(Leaderboard.group_id == group_id).all()

    leaderboard = [
        GroupLeaderboardEntry(
            user_id=entry.user_id,
            username=entry.username,
            xp=entry.xp,
            group_id=group_id
        )
        for entry in entries
    ]

    return sorted(leaderboard, key=lambda x: x.xp, reverse=True)