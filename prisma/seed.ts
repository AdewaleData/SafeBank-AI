import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// Pre-hashed with Python bcrypt (backend verify_password). Do not use bcryptjs here.
const ADMIN_PASSWORD_HASH =
  "$2b$10$.MCV0boAC9FAZZ8Pd65quucURNYY9a6DOI7y4SgtrgWjb5R8j/4tq";
const ADMIN_PIN_HASH =
  "$2b$10$H9V/fuL4gTufqy3ZbpqdCuFVRk9UmOuMrZcwQ8qWA9oDb/rGuAanW";

async function main() {
  console.log("SafeBank AI — seeding admin account...");

  const password = ADMIN_PASSWORD_HASH;
  const pin = ADMIN_PIN_HASH;

  const admin = await prisma.user.upsert({
    where: { email: "admin@safebank.ai" },
    update: {
      fullname: "SafeBank Admin",
      password,
      transactionPin: pin,
      role: Role.ADMIN,
      isFrozen: false,
    },
    create: {
      fullname: "SafeBank Admin",
      email: "admin@safebank.ai",
      phone: "+2348000000001",
      password,
      transactionPin: pin,
      balance: 1000000,
      accountNumber: "5012345678",
      role: Role.ADMIN,
      isFrozen: false,
    },
  });

  await prisma.emergencyFreeze.upsert({
    where: { userId: admin.id },
    update: { frozen: false, frozenAt: null },
    create: { userId: admin.id, frozen: false },
  });

  const userCount = await prisma.user.count();
  console.log(`Done. Total users: ${userCount}`);
  console.log("Admin login:");
  console.log("  Email:    admin@safebank.ai");
  console.log("  Password: Admin@12345");
  console.log("  PIN:      1234");
  console.log("  Account:  5012345678");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
