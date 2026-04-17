const prisma = require("../../utils/prisma");

const toDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d) ? null : d;
};


const { toLocalLiteral } = require("../../utils/dateHelper");

class RequestFormsData {
  async createRequest(data) {
  return await prisma.requestForm.create({
    data: {
      requestedBy: data.requestedBy,
      email: data.email,
      officeId: data.officeId ? parseInt(data.officeId) : null,
      designation: data.designation,
      destination: data.destination,
      purpose: data.purpose,
      departureDate: toDate(data.departureDate),
      arrivalDate: toDate(data.arrivalDate),
      departureTime: toDate(data.departureTime),
      arrivalTime: toDate(data.arrivalTime),
      authorizedPassengers: typeof data.authorizedPassengers === "string"
        ? JSON.parse(data.authorizedPassengers)
        : data.authorizedPassengers || [],
      remarks: data.remarks || "",
      attachments: data.attachments || null,
      requestId: data.requestId || null,
      updatedAt: new Date(),
      status: "pending",
    },
    include: {
      office: true,
    },
  });
}


  async updateRequest(id, data) {
    const updateData = { ...data };
    
    // Extract relation IDs and prepare connections
    const { officeId, driverId, vehicleId, attachment, ...scalarData } = updateData;
    const relations = {};

    if (officeId) scalarData.officeId = parseInt(officeId);
    if (driverId) scalarData.driverId = parseInt(driverId);
    if (vehicleId) scalarData.vehicleId = parseInt(vehicleId);

    // Handle date fields
    if (scalarData.departureDate) scalarData.departureDate = toLocalLiteral(scalarData.departureDate);
    if (scalarData.arrivalDate) scalarData.arrivalDate = toLocalLiteral(scalarData.arrivalDate);
    if (scalarData.departureTime) scalarData.departureTime = toLocalLiteral(scalarData.departureTime);
    if (scalarData.arrivalTime) scalarData.arrivalTime = toLocalLiteral(scalarData.arrivalTime);

    if (typeof scalarData.authorizedPassengers === "string") {
      scalarData.authorizedPassengers = JSON.parse(scalarData.authorizedPassengers);
    }

    return await prisma.requestForm.update({
      where: { id: parseInt(id) },
      data: {
        ...scalarData,
        ...relations
      },
      include: {
        office: true,
        drivers: true,
        vehicles: {
          include: {
            vehicleTypes: true,
          },
        },
      },
    });
  }

  async getRequestById(id) {
    return await prisma.requestForm.findUnique({
      where: { id: parseInt(id) },
      include: {
        office: true,
        drivers: true,
        vehicles: true,
        travels: true,
      },
    });
  }

  async getAllRequests() {
    return await prisma.requestForm.findMany({
      include: {
        office: true,
        drivers: true,
        vehicles: true,
        travels: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

module.exports = new RequestFormsData();
