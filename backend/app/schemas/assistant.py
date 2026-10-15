from pydantic import BaseModel
from typing import Optional, Dict

class ExplainRequest(BaseModel):
    finding_id: Optional[str] = None
    rule_id: str
    description: str
    html_snippet: Optional[str] = None
    target_url: Optional[str] = None

class WcagReference(BaseModel):
    guideline: str
    principle: str
    level: str
    url: str

class DisabilityImpact(BaseModel):
    blind: str
    low_vision: str
    motor: str
    cognitive: str

class ExplainResponse(BaseModel):
    finding_id: Optional[str] = None
    rule_id: str
    simple_explanation: str
    why_it_matters: str
    impact_by_disability: DisabilityImpact
    wcag_reference: WcagReference

class SuggestFixRequest(BaseModel):
    finding_id: Optional[str] = None
    rule_id: str
    html_snippet: str
    description: Optional[str] = None
    selector: Optional[str] = None

class SuggestFixResponse(BaseModel):
    finding_id: Optional[str] = None
    rule_id: str
    original_snippet: str
    suggested_snippet: str
    css_suggestion: Optional[str] = None
    alt_text_suggestion: Optional[str] = None
    explanation_of_fix: str
    verification_instructions: str

class SimplifyRequest(BaseModel):
    text: str
    level: Optional[str] = "plain_english"

class SimplifyResponse(BaseModel):
    original_text: str
    simplified_text: str
    key_points: list[str] = []
    reading_level: str
    disclaimer: str = "This summary is simplified for cognitive accessibility. For legal, medical, or critical financial decisions, always refer to the verified original text."

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    suggested_actions: list[str] = []
