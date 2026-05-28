from fastapi import APIRouter, BackgroundTasks
from app.models.document import DocumentProcessRequest
from app.services.pdf_processor import process_pdf_task

router = APIRouter()

@router.post("/process", status_code=202)
async def process_document(request: DocumentProcessRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_pdf_task, request)
    return {"status": "accepted", "message": "PDF processing started in the background"}
