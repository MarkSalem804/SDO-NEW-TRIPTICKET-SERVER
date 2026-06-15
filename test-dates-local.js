const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { unshiftLiteral } = require('./src/utils/dateHelper');

async function testArchivingLocal() {
  const reqs = await prisma.requestForm.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const now = new Date();

  reqs.forEach(req => {
    if (req.departureDate && req.departureTime) {
      const depDate = new Date(req.departureDate);
      const depTime = new Date(req.departureTime);
      
      const actualDepDateTime = new Date(
        depDate.getFullYear(),
        depDate.getMonth(),
        depDate.getDate(),
        depTime.getHours(),
        depTime.getMinutes(),
        depTime.getSeconds(),
        0
      );
      
      const unshifted = unshiftLiteral(actualDepDateTime);
      const isPassed = now > actualDepDateTime || now > unshifted;

      console.log(`ID: ${req.id}`);
      console.log(`Original DepDate (Local): ${depDate.toLocaleString()}`);
      console.log(`Original DepTime (Local): ${depTime.toLocaleString()}`);
      console.log(`Combined Literal (Local): ${actualDepDateTime.toLocaleString()}`);
      console.log(`Now (Local): ${now.toLocaleString()}`);
      console.log(`Is Passed: ${isPassed}`);
      console.log('---');
    }
  });

  await prisma.$disconnect();
}

testArchivingLocal();
