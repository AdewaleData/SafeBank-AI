import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing all SafeBank AI accounts and data...");
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE offline_queue, fraud_alerts, analytics, transactions, emergency_freeze, users RESTART IDENTITY CASCADE;
  `);
  const count = await prisma.user.count();
  console.log(`Done. Users remaining: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
