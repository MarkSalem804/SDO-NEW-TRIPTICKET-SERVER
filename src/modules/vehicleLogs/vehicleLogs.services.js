const vehicleLogsData = require("./vehicleLogs.data");
const prisma = require("../../utils/prisma");

class VehicleLogsServices {
  async recordScanByRFID(rfidNo) {
    // Lazy require to avoid circularity
    const travelsServices = require("../travels/travels.services"); 
    
    // 1. Determine "Physical" IN/OUT based on history (Default to OUT)
    const recentLog = await prisma.vehicleLogs.findFirst({
        where: { rfidNo: rfidNo },
        orderBy: { timestamp: 'desc' }
    });
    
    // If last was OUT, now it's IN. Otherwise (last was IN or no history), it's OUT.
    const physicalType = (recentLog && recentLog.type === "OUT") ? "IN" : "OUT";

    // 2. Try to update mission state via TravelServices
    let missionSummary = null;
    try {
        const missionRes = await travelsServices.handleRfidEvent(rfidNo);
        missionSummary = missionRes.message;
    } catch (err) {
        missionSummary = `(Mission Status: ${err.message})`;
    }

    // 3. Record the log entry for history
    const log = await vehicleLogsData.createLog(rfidNo, physicalType);

    // Return combined result to satisfy both History and Mission UI
    return {
        ...log,
        message: missionSummary // This will show in the success toast
    };
  }

  async getAttendanceToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.vehicleLogs.findMany({
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        vehicle: true
      }
    });
  }

  async getAllLogs() {
    // For a simple log page, fetch the last 100 logs or add pagination
    return await vehicleLogsData.getRecentLogs(100);
  }
}

module.exports = new VehicleLogsServices();
