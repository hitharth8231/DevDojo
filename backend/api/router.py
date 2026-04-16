from fastapi import APIRouter
from .routes import auth_routes, groups_routes, challenges_routes, leaderboard_routes, submission_routes, testcases_routes

router = APIRouter()

router.include_router(auth_routes.router)
router.include_router(groups_routes.router)
router.include_router(challenges_routes.router)
router.include_router(leaderboard_routes.router)
router.include_router(submission_routes.router)
router.include_router(testcases_routes.router)