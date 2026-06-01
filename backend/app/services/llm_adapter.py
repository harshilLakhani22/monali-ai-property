import os
from typing import List, Optional
from pydantic import BaseModel, Field
from google import genai

class ExtractedConstraint(BaseModel):
    field_key: str = Field(description="System key for the constraint, e.g., 'max_height', 'street_building_line'")
    label: str = Field(description="Human readable label, e.g., 'Maximum Height'")
    category: str = Field(description="Category of the constraint, e.g., 'zoning', 'setback', 'coverage'")
    value: str = Field(description="The extracted value, e.g., '2', '3', 'residential 1'")
    unit: Optional[str] = Field(default=None, description="The unit if applicable, e.g., 'storeys', 'm', '%'")
    source_text: str = Field(description="Exact verbatim snippet from the document proving the extraction")
    page_refs: List[int] = Field(description="List of page numbers where this is found")
    confidence: float = Field(description="Confidence score from 0.0 to 1.0")
    notes: Optional[str] = Field(default=None, description="Any reasoning or condition")

class ExtractionResult(BaseModel):
    constraints: List[ExtractedConstraint]

class GeminiAdapter:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not set in environment.")

    def extract_constraints(self, text: str) -> ExtractionResult:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")
        
        client = genai.Client(api_key=self.api_key)
        
        prompt = f"""
        Extract all relevant architectural, zoning, and stand constraints from the following document chunks.
        For each constraint found, provide the exact source text, value, unit, and page references.
        
        Document Chunks:
        {text}
        """
        
        # Using the structured output feature of google-genai
        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": ExtractionResult,
            },
        )
        
        if not response.parsed:
            return ExtractionResult(constraints=[])
            
        return response.parsed
