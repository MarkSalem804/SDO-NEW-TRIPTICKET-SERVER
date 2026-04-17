const prisma = require("../../utils/prisma");

class VehiclesData {
  async createVehicle(data) {
    return await prisma.vehicles.create({
      data: {
        plateNumber: data.plateNumber,
        vehicleName: data.vehicleName,
        rfidNo: data.rfidNo,
        vehicleTypeId: parseInt(data.vehicleTypeId),
      },
      include: {
        vehicleTypes: true,
      },
    });
  }

  async getAllVehicles() {
    return await prisma.vehicles.findMany({
      include: {
        vehicleTypes: true,
      },
    });
  }

  async getVehicleById(id) {
    return await prisma.vehicles.findUnique({
      where: { id: parseInt(id) },
      include: {
        vehicleTypes: true,
      },
    });
  }

  async updateVehicle(id, data) {
    // Sanitize data to exclude ID and relations from scalar update
    const { id: _, vehicleTypes, ...scalarData } = data;
    
    return await prisma.vehicles.update({
      where: { id: parseInt(id) },
      data: {
        ...scalarData,
        vehicleTypeId: scalarData.vehicleTypeId ? parseInt(scalarData.vehicleTypeId) : undefined
      },
      include: {
        vehicleTypes: true,
      },
    });
  }

  async deleteVehicle(id) {
    return await prisma.vehicles.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new VehiclesData();
