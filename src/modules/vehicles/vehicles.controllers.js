const vehiclesService = require("./vehicles.services");

class VehiclesController {
  async createVehicle(req, res) {
    try {
      const { vehicleName, plateNumber, vehicleTypeId, rfidNo } = req.body;
      const vehicle = await vehiclesService.createVehicle({ vehicleName, plateNumber, vehicleTypeId, rfidNo });
      res.status(201).json({ message: "Vehicle created successfully", vehicle });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllVehicles(req, res) {
    try {
      const vehicles = await vehiclesService.getAllVehicles();
      res.status(200).json(vehicles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getVehicleById(req, res) {
    try {
      const vehicle = await vehiclesService.getVehicleById(req.params.id);
      if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
      res.status(200).json(vehicle);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateVehicle(req, res) {
    try {
      const vehicle = await vehiclesService.updateVehicle(req.params.id, req.body);
      res.status(200).json({ message: "Vehicle updated successfully", vehicle });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteVehicle(req, res) {
    try {
      await vehiclesService.deleteVehicle(req.params.id);
      res.status(200).json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new VehiclesController();
