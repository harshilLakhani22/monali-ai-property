import os
import uuid
import time
import httpx
from dotenv import load_dotenv
import sys
import psycopg
from psycopg.rows import dict_row

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

db_url = os.getenv("DIRECT_URL")

# Find a document with chunks
with psycopg.connect(db_url, row_factory=dict_row) as conn:
    with conn.cursor() as cur:
        # Find a document that has chunks and is not just 'unknown' classification
        cur.execute('''
            SELECT DISTINCT d.id, d."projectId", d.name 
            FROM "Document" d
            JOIN "DocumentChunk" dc ON d.id = dc."documentId"
            WHERE dc.classification NOT IN ('unknown', 'sg_diagram')
            LIMIT 1
        ''')
        document = cur.fetchone()
        
        if not document:
            print("No documents found with valid chunks. Please run test_phase_4b.py first to process a PDF.")
            sys.exit(1)

project_id = document["projectId"]
document_id = document["id"]
print(f"Using Document: {document['name']} (ID: {document_id})")

aijob_id = str(uuid.uuid4())

with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        # Create pending AIJob for extraction
        cur.execute('INSERT INTO "AIJob" (id, "projectId", "documentId", type, status) VALUES (%s, %s, %s, %s, %s)',
                    (aijob_id, project_id, document_id, 'intelligence_extraction', 'pending'))
        conn.commit()

print(f"Created extraction AIJob {aijob_id}")

# Call FastAPI
print("Calling FastAPI extract-intelligence endpoint...")
with httpx.Client(timeout=30) as client:
    res = client.post("http://localhost:8000/api/documents/extract-intelligence", json={
        "document_id": document_id,
        "project_id": project_id
    })
    print(res.status_code, res.json())

# Wait and poll
print("Waiting for extraction (Gemini may take 10-20 seconds)...")
for _ in range(15):
    time.sleep(2)
    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT status, "errorLog" FROM "AIJob" WHERE id = %s', (aijob_id,))
            job = cur.fetchone()
            if job["status"] in ["completed", "failed"]:
                print("Job finished!")
                print(f"Final Job Status: {job['status']}")
                if job['errorLog']:
                    print(f"Error Log: {job['errorLog']}")
                
                if job['status'] == 'completed':
                    cur.execute('SELECT * FROM "Extraction" WHERE "documentId" = %s', (document_id,))
                    extractions = cur.fetchall()
                    print(f"\nExtracted {len(extractions)} constraints:")
                    for idx, ext in enumerate(extractions):
                        print(f"{idx+1}. [{ext['category']}] {ext['label']}: {ext['value']} {ext['unit'] or ''} (Conf: {ext['confidence']})")
                        print(f"   Source: {ext['sourceText'][:100]}...")
                break
    print("Still extracting...")
