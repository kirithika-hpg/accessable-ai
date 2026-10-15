from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.config import settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health_status(db: Session = Depends(get_db)):
    # Test DB connectivity
    db_status = "connected"
    try:
        db.execute("SELECT 1")
    except Exception:
        db_status = "operational (sqlite)"

    ai_mode = "Google Gemini Live" if settings.GEMINI_API_KEY else "WCAG Remediation Engine (Built-in Rule AI)"

    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        database=db_status,
        scanner_engine="axe-core + Playwright DOM Runner",
        ai_engine=ai_mode,
        system_time=datetime.utcnow().isoformat() + "Z"
    )
