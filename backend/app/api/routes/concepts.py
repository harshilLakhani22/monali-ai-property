from fastapi import APIRouter
from app.models.project import ConceptRequest, ConceptResponse
import uuid

router = APIRouter()

@router.post("/generate", response_model=ConceptResponse)
async def generate_concept(request: ConceptRequest):
    """
    Generate an AI spatial concept.
    This is currently a stub that simulates a successful generation.
    """
    # In the future, the heavy AI processing will happen here
    # e.g., calling services to run the layout algorithm
    
    concept_id = str(uuid.uuid4())
    
    return ConceptResponse(
        status="success",
        concept_id=concept_id,
        data={
            "message": f"Successfully generated a stub concept for project {request.project_id}",
            "type": request.project_type,
            "mock_layout": {
                "zones": ["Residential", "Green Space", "Commercial"],
                "total_area_sqm": 5000
            }
        }
    )
