import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.review import router as review_router

app = FastAPI()

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    print(f"Unhandled API error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "The review service could not complete the request. Check the backend logs and service credentials."})

app.include_router(review_router)


@app.get("/")
def home():
    return {
        "message": "Multi-Agent Code Review System API"
    }
