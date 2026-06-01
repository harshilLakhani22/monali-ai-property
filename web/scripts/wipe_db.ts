import { prisma } from '../src/lib/prisma'

async function main() {
  console.log("Wiping database tables...")
  await prisma.constraint.deleteMany()
  await prisma.extraction.deleteMany()
  await prisma.aIJob.deleteMany()
  await prisma.documentChunk.deleteMany()
  await prisma.document.deleteMany()
  await prisma.project.deleteMany()
  console.log("Database wiped successfully! (Kept User and Organization)")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
