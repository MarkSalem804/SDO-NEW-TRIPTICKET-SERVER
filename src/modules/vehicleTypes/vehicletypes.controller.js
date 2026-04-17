const vehicleTypesService = require("./vehicletypes.services");

class VehicleTypesController {
  async createVehicleType(req, res) {
    try {
      const { typeName } = req.body;
      const vehicleType = await vehicleTypesService.createVehicleType({ typeName });
      res.status(201).json({ message: "Vehicle type created successfully", vehicleType });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllVehicleTypes(req, res) {
    try {
      const vehicleTypes = await vehicleTypesService.getAllVehicleTypes();
      res.status(200).json(vehicleTypes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getVehicleTypeById(req, res) {
    try {
      const vehicleType = await vehicleTypesService.getVehicleTypeById(req.params.id);
      if (!vehicleType) return res.status(404).json({ message: "Vehicle type not found" });
      res.status(200).json(vehicleType);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateVehicleType(req, res) {
    try {
      const vehicleType = await vehicleTypesService.updateVehicleType(req.params.id, req.body);
      res.status(200).json({ message: "Vehicle type updated successfully", vehicleType });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteVehicleType(req, res) {
    try {
      await vehicleTypesService.deleteVehicleType(req.params.id);
      res.status(200).json({ message: "Vehicle type deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new VehicleTypesController();
