from pydantic import BaseModel
from typing import Optional, List

class ContentExtractRequest(BaseModel):
    url: str

class ContentExtractResponse(BaseModel):
    url: str
    title: str
    meta_description: Optional[str] = None
    readable_html: str
    plain_text: str
    headings: List[str] = []
    word_count: int
    estimated_read_time_minutes: int
    supported: bool = True
    notice: str = "Extracted for accessible distraction-free reading. Content remains copyright of original publisher."
