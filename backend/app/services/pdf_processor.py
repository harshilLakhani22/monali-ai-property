import os
import httpx
import fitz
import psycopg
import uuid
from psycopg.rows import dict_row
from dotenv import load_dotenv
from app.models.document import DocumentProcessRequest

load_dotenv()

def get_db_connection():
    db_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("Database URL not found in environment")
    return psycopg.connect(db_url, row_factory=dict_row)

def process_pdf_task(request: DocumentProcessRequest):
    conn = None
    try:
        conn = get_db_connection()
        
        # 1. Update AIJob to running
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE "AIJob" 
                SET status = 'running' 
                WHERE "documentId" = %s AND status = 'pending'
                RETURNING id
            """, (request.document_id,))
            job_row = cur.fetchone()
            if not job_row:
                # Might have already been picked up or doesn't exist
                print(f"No pending AIJob found for document {request.document_id}")
                return 

        job_id = job_row["id"]
        conn.commit()
        
        # 2. Download PDF
        try:
            with httpx.Client() as client:
                response = client.get(request.file_url, timeout=30.0)
                response.raise_for_status()
                pdf_bytes = response.content
        except Exception as e:
            raise Exception(f"Failed to download PDF from signed URL: {str(e)}")

        # 3. Read PDF with PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        pages_text = []
        total_text_len = 0
        
        for i in range(len(doc)):
            page = doc[i]
            text = page.get_text("text").strip()
            pages_text.append((i + 1, text))
            total_text_len += len(text)
            
        doc.close()
        
        # 4. Check for OCR requirement
        if len(pages_text) > 0 and (total_text_len / len(pages_text)) < 50:
            raise Exception("Scanned document detected. OCR pipeline required.")
            
        # 5. Insert DocumentChunks
        with conn.cursor() as cur:
            for page_num, text in pages_text:
                if len(text.strip()) > 0:
                    chunk_id = str(uuid.uuid4())
                    cur.execute("""
                        INSERT INTO "DocumentChunk" (id, "documentId", text, "pageRef")
                        VALUES (%s, %s, %s, %s)
                    """, (chunk_id, request.document_id, text, page_num))
            
            # 6. Update AIJob and Document
            cur.execute("""
                UPDATE "AIJob"
                SET status = 'completed', "completedAt" = NOW()
                WHERE id = %s
            """, (job_id,))
            
            cur.execute("""
                UPDATE "Document"
                SET status = 'extracted'
                WHERE id = %s
            """, (request.document_id,))
            
            conn.commit()
            print(f"Successfully processed document {request.document_id}")

    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        if conn:
            try:
                with conn.cursor() as cur:
                    # Update the AIJob directly without requiring job_id variable to be bound
                    cur.execute("""
                        UPDATE "AIJob"
                        SET status = 'failed', "errorLog" = %s, "completedAt" = NOW()
                        WHERE "documentId" = %s
                    """, (str(e), request.document_id))
                    
                    cur.execute("""
                        UPDATE "Document"
                        SET status = 'failed'
                        WHERE id = %s
                    """, (request.document_id,))
                    conn.commit()
            except Exception as inner_e:
                print(f"Failed to record error state: {str(inner_e)}")
    finally:
        if conn:
            conn.close()
