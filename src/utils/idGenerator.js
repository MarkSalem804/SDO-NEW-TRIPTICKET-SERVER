/**
 * Generator for IDs with the format: RRRR-MMDDYY-NNN
 * RRRR: 4 random digits
 * MMDDYY: Current date (Month, Day, Year)
 * NNN: Ticket/Request sequence number for the day
 */
async function generateTripId(prismaModel, idField) {
  const now = new Date();
  
  // 1. Get current date in MMDDYY format
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const datePart = `${mm}${dd}${yy}`;

  // 2. Generate 4 random digits
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();

  // 3. Get next ticket number for today
  if (!prismaModel) {
    throw new Error("ID Generator: Database model is not correctly initialized.");
  }

  const recordsToday = await prismaModel.findMany({
    where: {
      [idField]: {
        contains: `-${datePart}-`,
      },
    },
    select: {
      [idField]: true,
    },
  });

  let nextNo = 1;
  if (recordsToday.length > 0) {
    const sequences = recordsToday
      .map((r) => {
        const parts = r[idField].split("-");
        return parseInt(parts[2]);
      })
      .filter((s) => !isNaN(s));

    if (sequences.length > 0) {
      nextNo = Math.max(...sequences) + 1;
    }
  }

  const ticketNo = String(nextNo).padStart(3, "0");

  return `${randomPart}-${datePart}-${ticketNo}`;
}

module.exports = { generateTripId };
