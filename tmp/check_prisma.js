const prisma = require("../src/utils/prisma");
console.log("Available models on prisma object:");
console.log(Object.keys(prisma).filter(k => !k.startsWith("_") && !k.startsWith("$")));
process.exit(0);
