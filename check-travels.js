const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTravels() {
  const travels = await prisma.travels.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { requestForm: true }
  });

  travels.forEach(t => {
    console.log(`Travel ID: ${t.id}, Status: ${t.travelStatus}, Vehicle: ${t.vehicleId}`);
    if (t.requestForm) {
      console.log(`  Req ID: ${t.requestForm.id}, Status: ${t.requestForm.status}`);
      console.log(`  Req DepDate: ${t.requestForm.departureDate}`);
    } else {
      console.log("  No RequestForm");
    }
    console.log('---');
  });

  await prisma.$disconnect();
}

checkTravels();
