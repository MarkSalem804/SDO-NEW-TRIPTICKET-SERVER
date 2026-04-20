function toPhilippineISO(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleString("sv-SE", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).replace(" ", "T") + "+08:00";
}


function convertDatesToPhilippineTime(obj) {
  if (!obj || typeof obj !== "object") return obj;

  const result = {};
  for (const key in obj) {
    const value = obj[key];

    if (value instanceof Date || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value))) {
      result[key] = toPhilippineISO(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(v => convertDatesToPhilippineTime(v));
    } else if (typeof value === "object" && value !== null) {
      result[key] = convertDatesToPhilippineTime(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const toLocalLiteral = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d)) return null;
  // Shift the date by the timezone offset so Prisma saves the literal numbers as UTC
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
};

const unshiftLiteral = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d)) return null;
  // Reverse the shift by adding the timezone offset back
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
};

module.exports = { toPhilippineISO, convertDatesToPhilippineTime, toLocalLiteral, unshiftLiteral };
