const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.order.createMany({
    data: [
      { id: 101, product: "Laptop", price: 2500000, userId: 1 },
      { id: 102, product: "Mouse", price: 80000, userId: 1 },
      { id: 103, product: "Keyboard", price: 150000, userId: 2 },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Orders seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
