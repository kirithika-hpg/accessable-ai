from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class FindingBase(BaseModel):
    rule_id: str
    rule_name: str
    description: str
    severity: str
    wcag_tags: List[str] = []
    selector: str
    html_snippet: Optional[str] = None
    failure_summary: Optional[str] = None
    recommended_fix: Optional[str] = None
    manual_test_notes: Optional[str] = None

class FindingCreate(FindingBase):
    pass

class FindingResponse(FindingBase):
    id: str
    scan_id: str

    model_config = ConfigDict(from_attributes=True)
