const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function main() {
  const pendingJobs = await prisma.aIJob.findMany({
    where: { status: 'pending' },
    include: { document: true }
  });

  console.log(`Found ${pendingJobs.length} pending jobs.`);

  for (const job of pendingJobs) {
    if (!job.document) continue;

    console.log(`Retrying job for document: ${job.document.name}`);

    try {
      const response = await fetch(`http://localhost:8000/api/documents/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: job.documentId,
          project_id: job.projectId,
          file_url: 'RE-GENERATED-LATER', // Wait, the signed URL expired...
        }),
      });

      console.log(`Response status:`, response.status);
    } catch (e) {
      console.error(e);
    }
  }
}

main().finally(() => prisma.$disconnect());
