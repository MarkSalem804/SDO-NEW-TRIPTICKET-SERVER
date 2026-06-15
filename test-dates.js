const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { unshiftLiteral } = require('./src/utils/dateHelper');

async function testArchiving() {
  const reqs = await prisma.requestForm.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const now = new Date();

  reqs.forEach(req => {
    if (req.departureDate && req.departureTime) {
      const depDate = new Date(req.departureDate);
      const depTime = new Date(req.departureTime);
      
      // Assume the literal values are stored in UTC by Prisma (because of toLocalLiteral)
      // So we extract the literal values using getUTC methods
      const actualDepDateTime = new Date();
      actualDepDateTime.setFullYear(depDate.getUTCFullYear(), depDate.getUTCMonth(), depDate.getUTCDate());
      actualDepDateTime.setHours(depTime.getUTCHours(), depTime.getUTCMinutes(), depTime.getUTCSeconds(), 0);
      
      const unshifted = unshiftLiteral(actualDepDateTime);
      const isPassed = now > actualDepDateTime || now > unshifted;

      console.log(`ID: ${req.id}`);
      console.log(`Original DepDate: ${req.departureDate.toISOString()} | Original DepTime: ${req.departureTime.toISOString()}`);
      console.log(`Combined Literal: ${actualDepDateTime.toLocaleString()}`);
      console.log(`Unshifted Combined: ${unshifted.toLocaleString()}`);
      console.log(`Now: ${now.toLocaleString()}`);
      console.log(`Is Passed: ${isPassed}`);
      console.log('---');
    }
  });

  await prisma.$disconnect();
}

testArchiving();
