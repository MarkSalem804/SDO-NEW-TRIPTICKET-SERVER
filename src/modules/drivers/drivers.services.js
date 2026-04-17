const driversData = require("./drivers.data");
const socket = require("../../middlewares/socket-connection");

class DriversService {
  async createDriver(data) {
    const result = await driversData.createDriver(data);
    try { socket.getIO().emit("driver-update", { type: "CREATE", data: result }); } catch (err) {}
    return result;
  }

  async getAllDrivers() {
    return await driversData.getAllDrivers();
  }

  async getDriverById(id) {
    return await driversData.getDriverById(id);
  }

  async updateDriver(id, data) {
    const result = await driversData.updateDriver(id, data);
    try { socket.getIO().emit("driver-update", { type: "UPDATE", data: result }); } catch (err) {}
    return result;
  }

  async deleteDriver(id) {
    const result = await driversData.deleteDriver(id);
    try { socket.getIO().emit("driver-update", { type: "DELETE", id }); } catch (err) {}
    return result;
  }
}

module.exports = new DriversService();
