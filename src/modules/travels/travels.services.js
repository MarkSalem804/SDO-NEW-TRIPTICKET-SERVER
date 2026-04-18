const travelsData = require("./travels.data");
const generateReport = require("../../utils/reportGenerator");
const generateExcel = require("../../utils/excelGenerator");
const { format } = require("date-fns");
const socket = require("../../middlewares/socket-connection");

class TravelsServices {
  async handleRfidEvent(rfidNo) {
    if (!rfidNo) {
      throw new Error("rfidNo is required");
    }

    // 1. Find the vehicle associated with this RFID.
    const vehicle = await travelsData.getVehicleByRfid(rfidNo);
    if (!vehicle) {
      throw new Error("Vehicle not found for RFID: " + rfidNo);
    }

    // 2. Look for an active requestForm that has this vehicle assigned.
    const activeRequest = await travelsData.getActiveRequestForVehicle(vehicle.id);
    if (!activeRequest) {
      throw new Error("No approved or ongoing request found for vehicle: " + vehicle.plateNumber);
    }

    // 3. Check for an open travel record (departure already recorded).
    const openTravel = await travelsData.getOpenTravel(activeRequest.id, vehicle.id);

    if (openTravel) {
      // VEHICLE IN: This is a return.
      const updatedTravel = await travelsData.updateTravelReturn(openTravel.id, openTravel.type);
      
      // Emit socket event for real-time update
      try {
        const io = socket.getIO();
        io.emit("new-travel-log", { type: "IN", travel: updatedTravel });
      } catch (err) {
      }
      
      return {
        event: "IN",
        vehicle: vehicle.plateNumber,
        travel: updatedTravel,
        message: "Vehicle returned successfully. Travel COMPLETED.",
      };
    } else {
      // VEHICLE OUT: This is a departure.
      // 1. Check if we have a SCHEDULED travel record from approval
      const scheduledTravel = await travelsData.getScheduledTravel(activeRequest.id, vehicle.id);
      
      let travelRecord;
      if (scheduledTravel) {
        // Update the scheduled record to ongoing
        travelRecord = await travelsData.updateTravelDeparture(scheduledTravel.id);
      } else {
        // Create new if none exists (Urgent or direct capture)
        travelRecord = await travelsData.createTravel({
          requestFormId: activeRequest.id,
          driverId: activeRequest.driverId,
          vehicleId: vehicle.id,
        });
        // Set it to ONGOING (createTravel by default is just created, let's make sure it's mapped)
      }

      // Emit socket event for real-time update
      try {
        const io = socket.getIO();
        io.emit("new-travel-log", { type: "OUT", travel: travelRecord });
      } catch (err) {
      }

      return {
        event: "OUT",
        vehicle: vehicle.plateNumber,
        travel: travelRecord,
        message: "Vehicle departed successfully. Travel ONGOING.",
      };
    }
  }

  async getAllTravels() {
    return await travelsData.getAllTravels();
  }

  async updateTravel(id, data) {
    const updated = await travelsData.updateTravel(id, data);
    try {
      socket.getIO().emit("new-travel-log", { type: "UPDATE", travel: updated });
    } catch (err) {}
    return updated;
  }

  async deleteTravel(id) {
    const result = await travelsData.deleteTravel(id);
    try {
      socket.getIO().emit("new-travel-log", { type: "DELETE", id });
    } catch (err) {}
    return result;
  }

  async generateReport({ reportType, filterType, from, to, driverId }) {
    // 1. Fetch data based on filters
    let travels = await travelsData.getAllTravels();
    
    // Filter by driver if specified
    if (driverId) {
      travels = travels.filter(t => t.driverId === driverId || String(t.driverId) === String(driverId));
    }

    // Filter by date if applicable
    if (filterType === "custom" && from && to) {
      const startDate = new Date(from);
      const endDate = new Date(to);
      travels = travels.filter(t => {
        const d = t.departureDate || t.createdAt;
        const recordDate = new Date(d);
        return recordDate >= startDate && recordDate <= endDate;
      });
    } else if (filterType === "monthly") {
       const now = new Date();
       travels = travels.filter(t => {
         const d = t.departureDate || t.createdAt;
         const recordDate = new Date(d);
         return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
       });
    } else if (filterType === "weekly") {
       const now = new Date();
       const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
       travels = travels.filter(t => {
         const d = t.departureDate || t.createdAt;
         const recordDate = new Date(d);
         return recordDate >= startOfWeek;
       });
    }

    // 2. Format data for the specific report template
    const formattedData = {
      month: format(new Date(), "MMMM yyyy"),
      travels: travels.map(t => ({
        date: t.departureDate ? format(t.departureDate, "MM-dd-yyyy") : format(t.createdAt, "MM-dd-yyyy"),
        destination: t.requestForm?.destination || "N/A",
        tollFee: t.tollFee || "",
        distance: t.distance || "",
        fuel: t.fuel || "",
        driver: t.driver?.name || "N/A",
        passengers: t.requestForm?.authorizedPassengers ? 
          (Array.isArray(t.requestForm.authorizedPassengers) ? t.requestForm.authorizedPassengers.join(", ") : t.requestForm.authorizedPassengers) : "N/A",
        tripticketId: t.tripticketId || "N/A",
        requestor: t.requestForm?.requestedBy || "N/A",
        departure: t.departureTime ? format(t.departureTime, "hh:mm a") : "N/A",
        arrival: t.arrivalTime ? format(t.arrivalTime, "hh:mm a") : "N/A",
      }))
    };

    if (reportType === "driver-summary" && travels.length > 0) {
      formattedData.vehicleName = travels[0].vehicle?.vehicleName || "N/A";
      formattedData.plateNumber = travels[0].vehicle?.plateNumber || "N/A";
    } else {
      formattedData.vehicleName = "N/A";
      formattedData.plateNumber = "N/A";
    }

    // 3. Generate PDF
    return await generateReport(reportType, formattedData);
  }

  async generateExcelReport({ filterType, from, to, driverId }) {
    // 1. Fetch data based on filters (same logic as generateReport)
    let travels = await travelsData.getAllTravels();
    
    if (driverId) {
      travels = travels.filter(t => t.driverId === driverId || String(t.driverId) === String(driverId));
    }

    if (filterType === "custom" && from && to) {
      const startDate = new Date(from);
      const endDate = new Date(to);
      travels = travels.filter(t => {
        const d = t.departureDate || t.createdAt;
        const recordDate = new Date(d);
        return recordDate >= startDate && recordDate <= endDate;
      });
    } else if (filterType === "monthly") {
       const now = new Date();
       travels = travels.filter(t => {
         const d = t.departureDate || t.createdAt;
         const recordDate = new Date(d);
         return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
       });
    }

    // 2. Format for Excel
    const formattedData = {
      travels: travels.map(t => ({
        tripticketId: t.tripticketId || "N/A",
        driver: t.driver?.name || "N/A",
        vehicle: t.vehicle ? `${t.vehicle.vehicleName} (${t.vehicle.plateNumber})` : "N/A",
        requestor: t.requestForm?.requestedBy || "N/A",
        passengers: t.requestForm?.authorizedPassengers ? 
          (Array.isArray(t.requestForm.authorizedPassengers) ? t.requestForm.authorizedPassengers.join(", ") : t.requestForm.authorizedPassengers) : "N/A",
        departureDate: t.departureDate ? format(t.departureDate, "MM-dd-yyyy") : "N/A",
        departureTime: t.departureTime ? format(t.departureTime, "hh:mm a") : "N/A",
        arrivalDate: t.arrivalDate ? format(t.arrivalDate, "MM-dd-yyyy") : "N/A",
        arrivalTime: t.arrivalTime ? format(t.arrivalTime, "hh:mm a") : "N/A",
        approvedDate: t.createdAt ? format(t.createdAt, "MM-dd-yyyy hh:mm a") : "N/A"
      }))
    };

    return await generateExcel('travel-ticket-report', formattedData);
  }
}

module.exports = new TravelsServices();
