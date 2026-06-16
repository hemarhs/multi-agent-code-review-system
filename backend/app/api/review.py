from fastapi import APIRouter

from app.schemas.review import ReviewRequest
from app.schemas.review_response import ReviewResponse

from app.agents.orchestrator_agent import OrchestratorAgent
from app.services.database_service import DatabaseService

router = APIRouter()


@router.post("/review", response_model=ReviewResponse)
def review_code(request: ReviewRequest):

    db = DatabaseService()

    review = db.save_review(
        request.code,
        request.user_id
    )

    orchestrator = OrchestratorAgent()

    findings = orchestrator.review(
        request.code
    )

    for finding in findings:
        db.save_finding(
            review["id"],
            finding
        )

    return ReviewResponse(
        findings=findings
    )


@router.get("/reviews")
def get_reviews():

    db = DatabaseService()

    return db.get_reviews()


@router.get("/reviews/user/{user_id}")
def get_reviews_by_user(user_id: str):

    db = DatabaseService()

    return db.get_reviews_by_user(user_id)


@router.get("/reviews/{review_id}")
def get_review_findings(review_id: int):

    db = DatabaseService()

    return db.get_findings(review_id)


@router.get("/analytics/{user_id}")
def analytics(user_id: str):

    db = DatabaseService()

    return db.get_analytics(user_id)