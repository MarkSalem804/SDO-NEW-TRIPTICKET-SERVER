const prisma = require("../../utils/prisma");
const { toLocalLiteral } = require("../../utils/dateHelper");

class TravelsData {
  async getVehicleByRfid(rfidNo) {
    return await prisma.vehicles.findFirst({
      where: { rfidNo: rfidNo },
    });
  }

  // Find an active requestForm that has this vehicle assigned and is 'approved' or 'ongoing'.
  async getActiveRequestForVehicle(vehicleId) {
    // 1. Check for request with an ONGOING travel first (it's already out, must return)
    const ongoingTravel = await prisma.travels.findFirst({
      where: { 
        vehicleId, 
        travelStatus: "ONGOING" 
      },
      include: {
        requestForm: true
      }
    });
    
    if (ongoingTravel && ongoingTravel.requestForm) {
      return {
        ...ongoingTravel.requestForm,
        driverId: ongoingTravel.driverId // Ensure driverId is at the top level if needed by caller
      };
    }

    // 2. Check for request with a SCHEDULED travel
    const scheduledTravel = await prisma.travels.findFirst({
      where: {
        vehicleId,
        travelStatus: "SCHEDULED",
        requestForm: {
          status: "approved"
        }
      },
      include: {
        requestForm: true
      },
      orderBy: {
        requestForm: {
          departureDate: "asc"
        }
      }
    });

    if (scheduledTravel && scheduledTravel.requestForm) {
      return {
        ...scheduledTravel.requestForm,
        driverId: scheduledTravel.driverId
      };
    }

    return null;
  }

  // Check if there is an open travel record (departed but not arrived).
  async getOpenTravel(requestFormId, vehicleId) {
    // Check standard travels
    const standardTravel = await prisma.travels.findFirst({
      where: {
        requestFormId: requestFormId,
        vehicleId: vehicleId,
        departureTime: { not: null }, // Must have already left
        arrivalTime: null,           // But not yet returned
      },
    });

    if (standardTravel) return { ...standardTravel, type: "standard" };

    // Check urgent travels
    const urgentTravel = await prisma.urgentTravels.findFirst({
      where: {
        requestFormId: requestFormId,
        vehicleId: vehicleId,
        departureTime: { not: null },
        arrivalTime: null,
      },
    });

    if (urgentTravel) return { ...urgentTravel, type: "urgent" };

    return null;
  }

  async createTravel(data) {
    const { generateTripId } = require("../../utils/idGenerator");
    const tripticketId = await generateTripId(prisma.travels, "tripticketId");

    return await prisma.travels.create({
      data: {
        tripticketId: tripticketId,
        requestFormId: data.requestFormId,
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        departureTime: toLocalLiteral(new Date()),
        departureDate: toLocalLiteral(new Date()),
      },
    });
  }

  async createTravelFromRequest(request) {
    return await prisma.travels.create({
      data: {
        tripticketId: request.requestId,
        requestForm: { connect: { id: request.id } },
        driver: { connect: { id: request.driverId } },
        vehicle: { connect: { id: request.vehicleId } },
        // Logistical dates/times left blank to be populated by real-time scans
        departureTime: null,
        departureDate: null,
        arrivalDate: null,
        arrivalTime: null,
        travelStatus: "SCHEDULED"
      }
    });
  }

  // Look for a travel record that is scheduled but not yet departed.
  async getScheduledTravel(requestFormId, vehicleId) {
    return await prisma.travels.findFirst({
      where: {
        requestFormId: requestFormId,
        vehicleId: vehicleId,
        departureTime: null,
        travelStatus: "SCHEDULED"
      },
    });
  }

  async updateTravelDeparture(id) {
    return await prisma.travels.update({
      where: { id: parseInt(id) },
      data: {
        departureTime: toLocalLiteral(new Date()),
        departureDate: toLocalLiteral(new Date()),
        travelStatus: "ONGOING"
      },
    });
  }

  async updateTravelReturn(id, type) {
    if (type === "urgent") {
      return await prisma.urgentTravels.update({
        where: { id: parseInt(id) },
        data: {
          arrivalTime: toLocalLiteral(new Date()),
          arrivalDate: toLocalLiteral(new Date()),
        },
      });
    }

    return await prisma.travels.update({
      where: { id: parseInt(id) },
      data: {
        arrivalTime: toLocalLiteral(new Date()),
        arrivalDate: toLocalLiteral(new Date()),
        travelStatus: "COMPLETED"
      },
    });
  }

  async createUrgentTravel(data) {
    const { generateTripId } = require("../../utils/idGenerator");
    const urgentTripId = await generateTripId(prisma.urgentTravels, "urgentTripId");

    return await prisma.urgentTravels.create({
      data: {
        urgentTripId: urgentTripId,
        requestFormId: data.requestFormId,
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        departureTime: toLocalLiteral(new Date()),
        departureDate: toLocalLiteral(new Date()),
      },
    });
  }

  async updateRequestStatus(id, status) {
    return await prisma.requestForm.update({
      where: { id: parseInt(id) },
      data: { status: status },
    });
  }

  async getAllTravels() {
    return await prisma.travels.findMany({
      include: {
        requestForm: true,
        driver: true,
        vehicle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateTravel(id, data) {
    return await prisma.travels.update({
      where: { id: parseInt(id) },
      data: data,
    });
  }

  async deleteTravel(id) {
    return await prisma.travels.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new TravelsData();
