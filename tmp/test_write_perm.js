const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();

async function check() {
  try {
    const storageDir = process.env.APPROVED_TICKETS_PATH;
    console.log("storageDir:", storageDir);
    if (!storageDir) throw new Error("APPROVED_TICKETS_PATH not defined");

    console.log("Checking if folder exists...");
    await fs.mkdir(storageDir, { recursive: true });
    console.log("Folder checked/created.");

    const fileName = "test_write.txt";
    const fullPath = path.join(storageDir, fileName);
    console.log("Attempting to write to:", fullPath);

    await fs.writeFile(fullPath, "Hello World from check script");
    console.log("Successfully wrote test file!");
  } catch (err) {
    console.error("Check failed:", err);
  }
}

check();
