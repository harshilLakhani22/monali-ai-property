import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { Pool } from '../node_modules/@types/pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter, log: ['error', 'warn'] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPhase4A() {
  console.log("1. Finding a project ID to use...");
  const project = await prisma.project.findFirst();
  if (!project) {
    console.error("No project found in DB! Please create a project via UI first.");
    process.exit(1);
  }
  const projectId = project.id;
  console.log(`Using project ID: ${projectId}`);

  console.log("2. Uploading PDF to Supabase...");
  const filePath = path.resolve(process.cwd(), '../docs/test-data-room/01_demo_zoning_certificate_and_scheme_extract.pdf');
  const fileBuffer = fs.readFileSync(filePath);

  const storagePath = `${projectId}/test_zoning_${Date.now()}.pdf`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) {
    console.error("Upload failed:", uploadError);
    process.exit(1);
  }
  console.log("Upload successful:", uploadData);

  console.log("3. Generating Signed URL...");
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 900);

  if (signedUrlError || !signedUrlData) {
    console.error("Failed to generate signed URL:", signedUrlError);
    process.exit(1);
  }
  const signedUrl = signedUrlData.signedUrl;

  console.log("4. Creating DB Records...");
  const document = await prisma.document.create({
    data: {
      projectId,
      name: '01_demo_zoning_certificate_and_scheme_extract.pdf',
      type: 'unknown',
      url: storagePath,
      status: 'processing',
    }
  });

  const aiJob = await prisma.aIJob.create({
    data: {
      projectId,
      documentId: document.id,
      type: 'extraction',
      status: 'pending',
    }
  });
  console.log(`Created Document: ${document.id}, AIJob: ${aiJob.id}`);

  console.log("5. Calling FastAPI Endpoint...");
  const response = await fetch('http://localhost:8000/api/documents/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document_id: document.id,
      project_id: projectId,
      file_url: signedUrl,
    })
  });

  if (!response.ok) {
    console.error("FastAPI failed:", await response.text());
    process.exit(1);
  }
  console.log("FastAPI accepted the request:", await response.json());

  console.log("6. Waiting for background processing to finish (5 seconds)...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log("7. Checking final DB state...");
  const finalJob = await prisma.aIJob.findUnique({ where: { id: aiJob.id } });
  const finalDoc = await prisma.document.findUnique({ where: { id: document.id } });
  const chunks = await prisma.documentChunk.findMany({ where: { documentId: document.id } });

  console.log("--- FINAL STATUS ---");
  console.log(`AIJob Status: ${finalJob?.status}`);
  console.log(`AIJob Error: ${finalJob?.errorLog || 'None'}`);
  console.log(`Document Status: ${finalDoc?.status}`);
  console.log(`Document Chunks Extracted: ${chunks.length}`);
  if (chunks.length > 0) {
    console.log(`First Chunk Preview: ${chunks[0].text.substring(0, 100)}...`);
  }
}

testPhase4A();
