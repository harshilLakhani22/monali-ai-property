import os
import psycopg
from psycopg.rows import dict_row
from app.models.document import ExtractionRequest
from app.services.llm_adapter import GeminiAdapter
import uuid
import json

def get_db_connection():
    db_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("Database URL not found in environment")
    return psycopg.connect(db_url, row_factory=dict_row)

def extract_intelligence_task(request: ExtractionRequest):
    conn = None
    try:
        conn = get_db_connection()
        
        # 1. Update AIJob to running
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE "AIJob" 
                SET status = 'running' 
                WHERE id = (
                    SELECT id FROM "AIJob" 
                    WHERE "documentId" = %s AND type = 'intelligence_extraction' AND status = 'pending'
                    ORDER BY "createdAt" ASC LIMIT 1
                    FOR UPDATE SKIP LOCKED
                )
                RETURNING id
            """, (request.document_id,))
            job_row = cur.fetchone()
            if not job_row:
                print(f"No pending intelligence_extraction AIJob found for document {request.document_id}")
                return 

        job_id = job_row["id"]
        conn.commit()
        
        # 2. Delete old unverified extraction rows (idempotency)
        with conn.cursor() as cur:
            cur.execute("""
                DELETE FROM "Extraction"
                WHERE "documentId" = %s AND verified = false
            """, (request.document_id,))
            conn.commit()
            
        # 3. Fetch DocumentChunks
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, text, "pageRef", classification 
                FROM "DocumentChunk" 
                WHERE "documentId" = %s 
                AND classification NOT IN ('unknown', 'sg_diagram')
            """, (request.document_id,))
            chunks = cur.fetchall()
            
        if not chunks:
            # No valid chunks, complete gracefully
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE "AIJob"
                    SET status = 'completed', "completedAt" = NOW()
                    WHERE id = %s
                """, (job_id,))
                conn.commit()
                print("No relevant chunks to extract. Completed.")
            return

        # 4. Group text
        grouped_text = "Here are the document chunks for extraction:\\n"
        for idx, chunk in enumerate(chunks):
            grouped_text += f"\\n--- Chunk {idx+1} (Page {chunk['pageRef']}, Type: {chunk['classification']}) ---\\n"
            grouped_text += chunk['text'] + "\\n"
            
        # 5. Extract with LLM
        adapter = GeminiAdapter()
        extraction_result = adapter.extract_constraints(grouped_text)
        
        # 6. Insert into Extraction table
        with conn.cursor() as cur:
            for constraint in extraction_result.constraints:
                extraction_id = str(uuid.uuid4())
                page_refs_json = json.dumps(constraint.page_refs) if constraint.page_refs else "[]"
                
                cur.execute("""
                    INSERT INTO "Extraction" (id, "projectId", "documentId", "fieldKey", label, category, value, unit, "sourceText", confidence, "pageRefs", notes, verified)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, false)
                """, (
                    extraction_id, 
                    request.project_id, 
                    request.document_id, 
                    constraint.field_key,
                    constraint.label,
                    constraint.category,
                    constraint.value,
                    constraint.unit,
                    constraint.source_text,
                    constraint.confidence,
                    page_refs_json,
                    constraint.notes
                ))
            
            # 7. Update AIJob
            cur.execute("""
                UPDATE "AIJob"
                SET status = 'completed', "completedAt" = NOW()
                WHERE id = %s
            """, (job_id,))
            
            conn.commit()
            print(f"Successfully extracted {len(extraction_result.constraints)} constraints for document {request.document_id}")

    except Exception as e:
        print(f"Error extracting intelligence: {str(e)}")
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE "AIJob"
                        SET status = 'failed', "errorLog" = %s, "completedAt" = NOW()
                        WHERE "documentId" = %s AND type = 'intelligence_extraction' AND status = 'running'
                    """, (str(e), request.document_id))
                    conn.commit()
            except Exception as inner_e:
                print(f"Failed to record error state: {str(inner_e)}")
    finally:
        if conn:
            conn.close()
