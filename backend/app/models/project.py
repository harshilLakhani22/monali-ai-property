from pydantic import BaseModel
from typing import Optional, Dict, Any

class ConceptRequest(BaseModel):
    project_id: str
    project_type: str
    parameters: Optional[Dict[str, Any]] = None

class ConceptResponse(BaseModel):
    status: str
    concept_id: str
    data: Dict[str, Any]
