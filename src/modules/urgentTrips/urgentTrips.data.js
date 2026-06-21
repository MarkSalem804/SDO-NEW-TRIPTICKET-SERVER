const prisma = require("../../utils/prisma");

class UrgentTripsData {
  async getVehicleByRfid(rfidNo) {
    return await prisma.vehicles.findFirst({
      where: { rfidNo: rfidNo },
    });
  }

  async getLastUrgentTrip(rfidNo) {
    return await prisma.urgentTrips.findFirst({
      where: { rfidNo: rfidNo },
      orderBy: { timestamp: "desc" },
    });
  }

  async createUrgentTrip(rfidNo, vehicleId, type) {
    return await prisma.urgentTrips.create({
      data: {
        rfidNo: rfidNo,
        vehicleId: vehicleId,
        type: type,
      },
      include: {
        vehicle: true,
      },
    });
  }

  async getRecentUrgentTrips(limit = 100) {
    return await prisma.urgentTrips.findMany({
      take: limit,
      orderBy: { timestamp: "desc" },
      include: {
        vehicle: true,
      },
    });
  }

  async getTodayUrgentTrips() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.urgentTrips.findMany({
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { timestamp: "desc" },
      include: {
        vehicle: true,
      },
    });
  }
}

module.exports = new UrgentTripsData();
