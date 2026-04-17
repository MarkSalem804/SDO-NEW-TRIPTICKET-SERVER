const prisma = require("../src/utils/prisma");
console.log("--- PRISMA DIAGNOSTICS ---");
console.log("Model Keys:", Object.keys(prisma).filter(k => k.toLowerCase().includes("request")));
console.log("requestform exists:", !!prisma.requestform);
console.log("requestForm exists:", !!prisma.requestForm);
console.log("request_form exists:", !!prisma.request_form);
process.exit(0);
