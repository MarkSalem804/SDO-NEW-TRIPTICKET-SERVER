const prisma = require("../../utils/prisma");

class OfficesService {
  async getAllOffices() {
    return await prisma.offices.findMany({
      orderBy: {
        officeName: "asc",
      },
    });
  }
  async createOffice(data) {
    return await prisma.offices.create({
      data: {
        officeName: data.officeName,
        updatedAt: new Date(),
      },
    });
  }

  async updateOffice(id, data) {
    return await prisma.offices.update({
      where: { id: parseInt(id) },
      data: {
        officeName: data.officeName,
        updatedAt: new Date(),
      },
    });
  }

  async deleteOffice(id) {
    return await prisma.offices.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new OfficesService();
