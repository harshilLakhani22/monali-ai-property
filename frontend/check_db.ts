import { prisma } from './src/lib/prisma';

async function check() {
  const jobs = await prisma.aIJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(jobs);
}

check().finally(() => prisma.$disconnect());
