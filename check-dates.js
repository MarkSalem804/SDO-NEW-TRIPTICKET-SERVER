const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDates() {
  const reqs = await prisma.requestForm.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  reqs.forEach(r => {
    console.log(`ID: ${r.id}, Status: ${r.status}`);
    console.log(`DepDate: ${r.departureDate} | DepTime: ${r.departureTime}`);
    console.log(`Created: ${r.createdAt}`);
    console.log('---');
  });

  await prisma.$disconnect();
}

checkDates();
