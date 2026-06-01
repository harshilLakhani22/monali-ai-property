from pydantic import BaseModel

class DocumentProcessRequest(BaseModel):
    document_id: str
    project_id: str
    file_url: str

class ExtractionRequest(BaseModel):
    document_id: str
    project_id: str
