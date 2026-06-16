from pydantic import BaseModel


class Finding(BaseModel):
    agent: str
    severity: str
    title: str
    explanation: str
    suggested_fix: str
    confidence: float