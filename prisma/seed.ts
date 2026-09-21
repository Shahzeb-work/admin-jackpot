import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const PLACEHOLDER_ADMIN = {
  email: "admin@jackpot.test",
  password: "Admin123!",
  name: "Test Admin",
};

async function main() {
  const passwordHash = await bcrypt.hash(PLACEHOLDER_ADMIN.password, 12);

  const admin = await prisma.admin.upsert({
    where: { email: PLACEHOLDER_ADMIN.email },
    update: { passwordHash, name: PLACEHOLDER_ADMIN.name },
    create: {
      email: PLACEHOLDER_ADMIN.email,
      name: PLACEHOLDER_ADMIN.name,
      passwordHash,
    },
  });

  console.log(`Seeded admin: ${admin.email} (id: ${admin.id})`);
  console.log(`Placeholder login -> email: ${PLACEHOLDER_ADMIN.email}  password: ${PLACEHOLDER_ADMIN.password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
