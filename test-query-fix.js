const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQueryWithoutLocalLiteral() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  console.log("startOfToday ISO:", startOfToday.toISOString());
  console.log("endOfToday ISO:", endOfToday.toISOString());

  const reqs = await prisma.requestForm.findMany({
    where: {
      status: "approved",
      departureDate: {
        gte: startOfToday,
        lte: endOfToday
      }
    },
    select: {
      id: true,
      departureDate: true
    }
  });

  console.log("Found today's approved requests:", reqs.length);
  reqs.forEach(r => console.log(r.id, r.departureDate.toISOString()));

  await prisma.$disconnect();
}

testQueryWithoutLocalLiteral();
