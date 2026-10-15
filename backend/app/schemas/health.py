from pydantic import BaseModel
from typing import Dict

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    scanner_engine: str
    ai_engine: str
    system_time: str
