from pydantic import BaseModel


class ReviewRequest(BaseModel):
    code: str
    user_id: str