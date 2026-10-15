import json
from pydantic import BaseModel, HttpUrl, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.finding import FindingResponse

class ScanCreateRequest(BaseModel):
    url: str

class ScanStartResponse(BaseModel):
    scan_id: str
    target_url: str
    message: str

class ScanResponse(BaseModel):
    id: str
    user_id: Optional[int] = None
    target_url: str
    status: str
    error_message: Optional[str] = None
    total_issues: int
    critical_count: int
    serious_count: int
    moderate_count: int
    minor_count: int
    accessibility_score: float
    scan_duration_ms: float
    scanned_at: datetime
    findings: List[FindingResponse] = []

    model_config = ConfigDict(from_attributes=True)

    @field_validator('findings', mode='before')
    def parse_wcag_tags_if_needed(cls, v):
        formatted = []
        for item in v:
            if hasattr(item, '__dict__'):
                d = dict(item.__dict__)
                if isinstance(d.get('wcag_tags'), str):
                    try:
                        d['wcag_tags'] = json.loads(d['wcag_tags'])
                    except:
                        d['wcag_tags'] = [t.strip() for t in d['wcag_tags'].split(',') if t.strip()]
                formatted.append(d)
            elif isinstance(item, dict):
                d = dict(item)
                if isinstance(d.get('wcag_tags'), str):
                    try:
                        d['wcag_tags'] = json.loads(d['wcag_tags'])
                    except:
                        d['wcag_tags'] = [t.strip() for t in d['wcag_tags'].split(',') if t.strip()]
                formatted.append(d)
            else:
                formatted.append(item)
        return formatted
