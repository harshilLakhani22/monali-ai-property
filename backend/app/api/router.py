from fastapi import APIRouter
from app.api.routes import health, concepts, documents

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(concepts.router, prefix="/concepts", tags=["concepts"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
