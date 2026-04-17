const vehicleTypesData = require("./vehicletypes.data");

class VehicleTypesService {
  async createVehicleType(data) {
    return await vehicleTypesData.createVehicleType(data);
  }

  async getAllVehicleTypes() {
    return await vehicleTypesData.getAllVehicleTypes();
  }

  async getVehicleTypeById(id) {
    return await vehicleTypesData.getVehicleTypeById(id);
  }

  async updateVehicleType(id, data) {
    return await vehicleTypesData.updateVehicleType(id, data);
  }

  async deleteVehicleType(id) {
    return await vehicleTypesData.deleteVehicleType(id);
  }
}

module.exports = new VehicleTypesService();
