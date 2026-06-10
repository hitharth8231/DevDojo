from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from models.user import Token, UserCreate, UserOut, UserUpdate
from services.auth_service import create_user, get_user_by_email, update_user_profile, delete_user_by_id
from core.security import get_current_user, create_access_token, create_refresh_token
from utils.password_utils import verify_password
from core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = create_user(db, user)
    return UserOut(id=new_user.id, username=new_user.username, email=new_user.email, github_username=new_user.github_username)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return Token(
        access_token=create_access_token(user_id=user.id, email=user.email),
        refresh_token=create_refresh_token(user_id=user.id, email=user.email),
    )

@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserOut(**current_user)

@router.put("/me", response_model=UserOut)
async def update_me(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["id"]
    updated_user = update_user_profile(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(id=updated_user.id, username=updated_user.username, email=updated_user.email, github_username=updated_user.github_username)

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    success = delete_user_by_id(db, current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="User not found")

@router.post("/refresh")
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """
    Takes a refresh_token and returns a new access_token
    Allows users to stay logged in without re-entering credentials
    """
    from core.security import decode_token
    from services.auth_service import get_user_by_id
    
    # Decode the refresh token
    token_data = decode_token(refresh_token)
    if not token_data or not token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Verify user still exists in database
    user = get_user_by_id(db, token_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create and return new access token
    new_access_token = create_access_token(
        user_id=user.id,
        email=user.email
    )
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }