const urgentTripsData = require("./urgentTrips.data");
const socket = require("../../middlewares/socket-connection");

class UrgentTripsServices {
  /**
   * Record an urgent trip scan via RFID.
   * Logic: If last scan was OUT, this is IN. Otherwise (no history or last was IN), it's OUT.
   */
  async recordUrgentScan(rfidNo) {
    // 1. Find the vehicle associated with this RFID
    const vehicle = await urgentTripsData.getVehicleByRfid(rfidNo);
    if (!vehicle) {
      throw new Error("Vehicle not found for RFID: " + rfidNo);
    }

    // 2. Check the last urgent trip for this RFID to determine IN/OUT
    const lastTrip = await urgentTripsData.getLastUrgentTrip(rfidNo);
    const type = lastTrip && lastTrip.type === "OUT" ? "IN" : "OUT";

    // 3. Create the urgent trip record
    const urgentTrip = await urgentTripsData.createUrgentTrip(rfidNo, vehicle.id, type);

    // 4. Emit socket event for real-time update
    try {
      const io = socket.getIO();
      io.emit("new-urgent-trip", { type, urgentTrip });
    } catch (err) {
      // Socket may not be initialized, that's fine
    }

    return {
      ...urgentTrip,
      message: type === "OUT"
        ? `Urgent Trip OUT recorded for ${vehicle.vehicleName || vehicle.plateNumber}`
        : `Urgent Trip IN (Return) recorded for ${vehicle.vehicleName || vehicle.plateNumber}`,
    };
  }

  async getTodayUrgentTrips() {
    return await urgentTripsData.getTodayUrgentTrips();
  }

  async getAllUrgentTrips() {
    return await urgentTripsData.getRecentUrgentTrips(100);
  }
}

module.exports = new UrgentTripsServices();
