const driversService = require("./drivers.services");
const socket = require("../../middlewares/socket-connection");

class DriversController {
  async createDriver(req, res) {
    try {
      const { name, driverEmail, driverContactNo } = req.body;
      const driver = await driversService.createDriver({
        name,
        driverEmail,
        driverContactNo,
      });
      socket.getIO().emit("driver-update", { action: "create", driver });
      res.status(201).json({ message: "Driver created successfully", driver });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllDrivers(req, res) {
    try {
      const drivers = await driversService.getAllDrivers();
      res.status(200).json(drivers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getDriverById(req, res) {
    try {
      const driver = await driversService.getDriverById(req.params.id);
      if (!driver) return res.status(404).json({ message: "Driver not found" });
      res.status(200).json(driver);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateDriver(req, res) {
    try {
      const driver = await driversService.updateDriver(req.params.id, req.body);
      socket.getIO().emit("driver-update", { action: "update", driver });
      res.status(200).json({ message: "Driver updated successfully", driver });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteDriver(req, res) {
    try {
      await driversService.deleteDriver(req.params.id);
      socket.getIO().emit("driver-update", { action: "delete", id: req.params.id });
      res.status(200).json({ message: "Driver deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new DriversController();
