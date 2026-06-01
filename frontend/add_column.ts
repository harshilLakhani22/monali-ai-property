import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "AIJob" ADD COLUMN "message" TEXT;`);
    console.log("Successfully added 'message' column to AIJob table");
  } catch (e: any) {
    if (e.message.includes('already exists')) {
        console.log("Column already exists");
    } else {
        console.error("Error adding column:", e);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
