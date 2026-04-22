const prisma = require("../../utils/prisma");

class VehiclesData {
  async createVehicle(data) {
    return await prisma.vehicles.create({
      data: {
        plateNumber: data.plateNumber,
        vehicleName: data.vehicleName,
        rfidNo: data.rfidNo,
        vehicleTypeId: parseInt(data.vehicleTypeId),
        driverId: data.driverId ? parseInt(data.driverId) : null,
      },
      include: {
        vehicleTypes: true,
        driver: true,
      },
    });
  }

  async getAllVehicles() {
    return await prisma.vehicles.findMany({
      include: {
        vehicleTypes: true,
        driver: true,
      },
    });
  }

  async getVehicleById(id) {
    return await prisma.vehicles.findUnique({
      where: { id: parseInt(id) },
      include: {
        vehicleTypes: true,
        driver: true,
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
        vehicleTypeId: scalarData.vehicleTypeId ? parseInt(scalarData.vehicleTypeId) : undefined,
        driverId: scalarData.driverId ? parseInt(scalarData.driverId) : (scalarData.driverId === null ? null : undefined)
      },
      include: {
        vehicleTypes: true,
        driver: true,
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
