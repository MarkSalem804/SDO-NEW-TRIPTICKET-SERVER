const prisma = require("../../utils/prisma");

class VehicleTypesData {
  async createVehicleType(data) {
    return await prisma.vehicleTypes.create({
      data: {
        typeName: data.typeName,
      },
    });
  }

  async getAllVehicleTypes() {
    return await prisma.vehicleTypes.findMany();
  }

  async getVehicleTypeById(id) {
    return await prisma.vehicleTypes.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async updateVehicleType(id, data) {
    return await prisma.vehicleTypes.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  async deleteVehicleType(id) {
    return await prisma.vehicleTypes.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new VehicleTypesData();
