const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  try {
    const r = await prisma.requestform.findMany({
      take: 1,
      orderBy: { createdAt: "desc" }
    });
    console.log(JSON.stringify(r, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
