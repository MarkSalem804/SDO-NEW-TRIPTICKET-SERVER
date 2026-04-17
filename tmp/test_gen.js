const generateTicket = require("../src/utils/generateTicket");
const fs = require("fs/promises");
const path = require("path");

async function test() {
  try {
    const data = {
      requestId: "TEST-ID",
      date: new Date().toLocaleDateString(),
      departureDate: new Date().toLocaleDateString(),
      departureTime: "10:00 AM",
      arrivalDate: new Date().toLocaleDateString(),
      arrivalTime: "11:00 AM",
      destination: "Test Destination",
      remarks: "Test Remarks",
      purpose: "Test Purpose",
      requestedBy: "Test User",
      driverName: "Test Driver",
      vehicleName: "Test Vehicle",
      plateNumber: "TEST-123",
      fuel: "",
      passengers: ["Passenger 1", "Passenger 2"],
      authorityName: "Test Authority",
      authorityPlantilla: "Test Plantilla",
      authoritySignature: null
    };

    console.log("Generating ticket...");
    const pdfBuffer = await generateTicket(data);
    console.log("PDF Buffer length:", pdfBuffer.length);

    const testPath = path.join(__dirname, "tmp/test_ticket.pdf");
    await fs.writeFile(testPath, pdfBuffer);
    console.log("PDF saved to:", testPath);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
