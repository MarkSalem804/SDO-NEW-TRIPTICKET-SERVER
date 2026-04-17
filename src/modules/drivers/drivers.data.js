const prisma = require("../../utils/prisma");

class DriversData {
  async createDriver(data) {
    return await prisma.drivers.create({
      data: {
        name: data.name,
        driverEmail: data.driverEmail,
        driverContactNo: data.driverContactNo,
      },
    });
  }

  async getAllDrivers() {
    return await prisma.drivers.findMany();
  }

  async getDriverById(id) {
    return await prisma.drivers.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async updateDriver(id, data) {
    return await prisma.drivers.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  async deleteDriver(id) {
    return await prisma.drivers.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new DriversData();
