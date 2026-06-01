const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendingJobs = await prisma.aIJob.updateMany({
    where: { status: 'pending' },
    data: { 
      status: 'failed', 
      errorLog: 'Job stuck in pending. FastAPI backend was not reached due to a URL routing misconfiguration. Please upload the document again.'
    }
  });

  const pendingDocs = await prisma.document.updateMany({
    where: { status: 'processing' },
    data: { status: 'failed' }
  });

  console.log(`Updated ${pendingJobs.count} jobs and ${pendingDocs.count} documents to failed.`);
}

main().finally(() => prisma.$disconnect());
