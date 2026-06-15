const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTravels() {
  const travels = await prisma.travels.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: { requestForm: true }
  });

  travels.forEach(t => {
    if (t.requestForm) {
      console.log(`Req DepDate ISO: ${t.requestForm.departureDate.toISOString()}`);
    }
  });

  await prisma.$disconnect();
}

checkTravels();
