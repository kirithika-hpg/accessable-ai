from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.preferences import UserPreference
from app.schemas.preferences import PreferencesResponse, PreferencesUpdate
from app.core.security import get_current_user

router = APIRouter(prefix="/preferences", tags=["Preferences"])

@router.get("", response_model=PreferencesResponse)
def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user:
        return PreferencesResponse()

    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        # Create default
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("", response_model=PreferencesResponse)
def update_user_preferences(
    payload: PreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user:
        return PreferencesResponse(**payload.dict())

    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    for key, value in payload.dict(exclude_unset=True).items():
        if hasattr(pref, key) and value is not None:
            setattr(pref, key, value)

    db.commit()
    db.refresh(pref)
    return pref
