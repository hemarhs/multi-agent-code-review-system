from pydantic import BaseModel

from app.schemas.finding import Finding


class ReviewResponse(BaseModel):
    findings: list[Finding]