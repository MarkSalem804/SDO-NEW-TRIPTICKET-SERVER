const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { toLocalLiteral } = require('./src/utils/dateHelper');

async function testQuery() {
  const now = new Date();
  const startOfToday = toLocalLiteral(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
  const endOfToday = toLocalLiteral(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));

  console.log("startOfToday:", startOfToday);
  console.log("endOfToday:", endOfToday);

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
  reqs.forEach(r => console.log(r.id, r.departureDate));

  await prisma.$disconnect();
}

testQuery();
