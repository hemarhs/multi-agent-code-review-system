from supabase import create_client
from dotenv import load_dotenv

import os

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)


class DatabaseService:

    def save_review(self, code: str, user_id: str):

     response = (
        supabase
        .table("reviews")
        .insert({
            "code": code,
            "user_id": user_id
        })
        .execute()
     )

     return response.data[0]

    def save_finding(self, review_id: int, finding):

        (
            supabase
            .table("findings")
            .insert({
                "review_id": review_id,
                "agent": finding.agent,
                "severity": finding.severity,
                "title": finding.title,
                "explanation": finding.explanation,
                "suggested_fix": finding.suggested_fix,
                "confidence": finding.confidence
            })
            .execute()
        )

    def get_reviews(self):

        response = (
            supabase
            .table("reviews")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return response.data
    
    def get_reviews_by_user(self, user_id: str):

     response = (
        supabase
        .table("reviews")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
     )

     return response.data

    def get_findings(self, review_id: int):

        response = (
            supabase
            .table("findings")
            .select("*")
            .eq("review_id", review_id)
            .execute()
        )

        return response.data

    def get_analytics(self, user_id: str):

     reviews = (
        supabase
        .table("reviews")
        .select("*")
        .eq("user_id", user_id)
        .execute()
     )

     review_ids = [
        review["id"]
        for review in reviews.data
     ]

     findings = []

     if review_ids:

        findings_response = (
            supabase
            .table("findings")
            .select("*")
            .in_("review_id", review_ids)
            .execute()
        )

        findings = findings_response.data

     high = len([
        f for f in findings
        if f["severity"] == "HIGH"
     ])

     medium = len([
        f for f in findings
        if f["severity"] == "MEDIUM"
     ])

     low = len([
        f for f in findings
        if f["severity"] == "LOW"
    ])

     return {
        "total_reviews": len(reviews.data),
        "total_findings": len(findings),
        "high": high,
        "medium": medium,
        "low": low
     }