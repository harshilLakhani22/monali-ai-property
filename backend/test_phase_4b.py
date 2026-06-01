import os
import uuid
import time
import httpx
from dotenv import load_dotenv
import sys
import psycopg
from psycopg.rows import dict_row

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
db_url = os.getenv("DIRECT_URL")

# Find a project
with psycopg.connect(db_url, row_factory=dict_row) as conn:
    with conn.cursor() as cur:
        cur.execute('SELECT id FROM "Project" LIMIT 1')
        project = cur.fetchone()
        if not project:
            # Create a dummy project if none
            user_id = str(uuid.uuid4())
            cur.execute('INSERT INTO "User" (id, email) VALUES (%s, %s)', (user_id, "test@test.com"))
            org_id = str(uuid.uuid4())
            cur.execute('INSERT INTO "Organization" (id, name) VALUES (%s, %s)', (org_id, "Test Org"))
            project_id = str(uuid.uuid4())
            cur.execute('INSERT INTO "Project" (id, "organizationId", name, type, status, "userId") VALUES (%s, %s, %s, %s, %s, %s)', (project_id, org_id, "Test Project", "single_stand", "active", user_id))
            conn.commit()
        else:
            project_id = project["id"]

print(f"Using project: {project_id}")

# Upload file
if len(sys.argv) < 2:
    print("Usage: python script.py <file_path>")
    sys.exit(1)
file_path = sys.argv[1]
file_name = os.path.basename(file_path)
storage_path = f"{project_id}/test_upload_{int(time.time())}.pdf"

print("Uploading to Supabase Storage...")
with httpx.Client() as client:
    # Use service role key to upload
    with open(file_path, "rb") as f:
        res = client.post(
            f"{supabase_url}/storage/v1/object/documents/{storage_path}",
            headers={"Authorization": f"Bearer {supabase_key}", "apikey": supabase_key},
            content=f.read()
        )
        res.raise_for_status()

    # Get signed URL
    print("Getting signed URL...")
    res = client.post(
        f"{supabase_url}/storage/v1/object/sign/documents/{storage_path}",
        headers={"Authorization": f"Bearer {supabase_key}", "apikey": supabase_key},
        json={"expiresIn": 900}
    )
    res.raise_for_status()
    signed_url = supabase_url + "/storage/v1" + res.json()["signedURL"]

# Create DB records
document_id = str(uuid.uuid4())
aijob_id = str(uuid.uuid4())

with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute('INSERT INTO "Document" (id, "projectId", name, type, url, status) VALUES (%s, %s, %s, %s, %s, %s)',
                    (document_id, project_id, file_name, 'unknown', storage_path, 'processing'))
        cur.execute('INSERT INTO "AIJob" (id, "projectId", "documentId", type, status) VALUES (%s, %s, %s, %s, %s)',
                    (aijob_id, project_id, document_id, 'extraction', 'pending'))
        conn.commit()

print(f"Created Document {document_id} and AIJob {aijob_id}")

# Call FastAPI
print("Calling FastAPI process endpoint...")
with httpx.Client() as client:
    res = client.post("http://localhost:8000/api/documents/process", json={
        "document_id": document_id,
        "project_id": project_id,
        "file_url": signed_url
    })
    print(res.status_code, res.json())

# Wait and poll
print("Waiting for processing...")
for _ in range(10):
    time.sleep(2)
    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT status, "errorLog" FROM "AIJob" WHERE id = %s', (aijob_id,))
            job = cur.fetchone()
            if job["status"] in ["completed", "failed"]:
                print("Job finished!")
                print(f"Final Job Status: {job['status']}")
                print(f"Error Log: {job['errorLog']}")
                
                cur.execute('SELECT COUNT(*) FROM "DocumentChunk" WHERE "documentId" = %s', (document_id,))
                count = cur.fetchone()["count"]
                print(f"Chunks created: {count}")
                
                cur.execute('SELECT text, classification FROM "DocumentChunk" WHERE "documentId" = %s LIMIT 3', (document_id,))
                chunks = cur.fetchall()
                for i, chunk in enumerate(chunks):
                    print(f"Chunk {i+1} classification: {chunk['classification']}")
                    print(f"Chunk {i+1} text snippet: {chunk['text'][:100]}...")
                break
    print("Still running...")
