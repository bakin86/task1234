const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: "Temuulen", email: "temuulen@example.com", role: "ADMIN" },
      { name: "Bat", email: "bat@example.com", role: "USER" },
      { name: "Enkh", email: "enkh@example.com", role: "USER" },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Users seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
