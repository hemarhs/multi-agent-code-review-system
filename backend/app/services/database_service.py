import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class DatabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be configured in backend/.env")
        self.supabase = create_client(url, key)

    def save_review(self, code: str, user_id: str):
        response = self.supabase.table("reviews").insert({"code": code, "user_id": user_id}).execute()
        return response.data[0]

    def save_finding(self, review_id: int, finding):
        self.supabase.table("findings").insert({
            "review_id": review_id,
            "agent": finding.agent,
            "severity": finding.severity,
            "title": finding.title,
            "explanation": finding.explanation,
            "suggested_fix": finding.suggested_fix,
            "confidence": finding.confidence,
        }).execute()

    def get_reviews(self):
        return self.supabase.table("reviews").select("*").order("created_at", desc=True).execute().data

    def get_reviews_by_user(self, user_id: str):
        return self.supabase.table("reviews").select("*").eq("user_id", user_id).order("created_at", desc=True).execute().data

    def get_findings(self, review_id: int):
        return self.supabase.table("findings").select("*").eq("review_id", review_id).execute().data

    def get_analytics(self, user_id: str):
        reviews = self.supabase.table("reviews").select("*").eq("user_id", user_id).execute().data
        review_ids = [review["id"] for review in reviews]
        findings = []
        if review_ids:
            findings = self.supabase.table("findings").select("*").in_("review_id", review_ids).execute().data

        return {
            "total_reviews": len(reviews),
            "total_findings": len(findings),
            "high": sum(f["severity"] == "HIGH" for f in findings),
            "medium": sum(f["severity"] == "MEDIUM" for f in findings),
            "low": sum(f["severity"] == "LOW" for f in findings),
        }
