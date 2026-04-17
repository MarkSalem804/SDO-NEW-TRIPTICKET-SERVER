const vehiclesData = require("./vehicles.data");

class VehiclesService {
  async createVehicle(data) {
    return await vehiclesData.createVehicle(data);
  }

  async getAllVehicles() {
    return await vehiclesData.getAllVehicles();
  }

  async getVehicleById(id) {
    return await vehiclesData.getVehicleById(id);
  }

  async updateVehicle(id, data) {
    return await vehiclesData.updateVehicle(id, data);
  }

  async deleteVehicle(id) {
    return await vehiclesData.deleteVehicle(id);
  }
}

module.exports = new VehiclesService();
