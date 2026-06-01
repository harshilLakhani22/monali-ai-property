import os
import psycopg
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL").split("?")[0]

with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute('TRUNCATE TABLE "Constraint", "Extraction", "AIJob", "DocumentChunk", "Document", "Project", "User", "Organization" CASCADE;')
        conn.commit()
print("Wiped ALL data successfully.")
