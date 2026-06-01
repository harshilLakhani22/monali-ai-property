import os
import psycopg
from psycopg.rows import dict_row

def main():
    db_url = "postgresql://postgres.aajghccqhdsvrudzdswg:vyh9jL67*bj.Gf.@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT id, status, "errorLog", "documentId" FROM "AIJob" ORDER BY "createdAt" DESC LIMIT 5')
            rows = cur.fetchall()
            for r in rows:
                print(r)

if __name__ == '__main__':
    main()
