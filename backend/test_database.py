from app.services.database_service import DatabaseService

db = DatabaseService()

review = db.save_review(
    "password = 'admin123'"
)

print(review)