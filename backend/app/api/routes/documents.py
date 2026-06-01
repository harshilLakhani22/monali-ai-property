from fastapi import APIRouter, BackgroundTasks
from app.models.document import DocumentProcessRequest, ExtractionRequest
from app.services.pdf_processor import process_pdf_task
from app.services.intelligence_extractor import extract_intelligence_task

router = APIRouter()

@router.post("/process", status_code=202)
async def process_document(request: DocumentProcessRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_pdf_task, request)
    return {"status": "accepted", "message": "PDF processing started in the background"}

@router.post("/extract-intelligence", status_code=202)
async def extract_intelligence(request: ExtractionRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(extract_intelligence_task, request)
    return {"status": "accepted", "message": "Intelligence extraction started in the background"}
