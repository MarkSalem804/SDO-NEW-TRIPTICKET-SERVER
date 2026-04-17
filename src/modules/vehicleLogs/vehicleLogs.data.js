const prisma = require("../../utils/prisma");

class VehicleLogsData {
  async createLog(rfidNo, type) {
    // First, find the vehicle with this RFID
    const vehicle = await prisma.vehicles.findFirst({
      where: {
        rfidNo: {
          equals: rfidNo
        }
      }
    });

    if (!vehicle) {
      throw new Error("Vehicle not registered with this RFID");
    }

    return await prisma.vehicleLogs.create({
      data: {
        rfidNo,
        vehicleId: vehicle.id,
        type: type, // "IN" or "OUT"
      },
      include: {
        vehicle: true
      }
    });
  }

  async getRecentLogs(limit = 10) {
    return await prisma.vehicleLogs.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      include: {
        vehicle: true
      }
    });
  }
}

module.exports = new VehicleLogsData();
