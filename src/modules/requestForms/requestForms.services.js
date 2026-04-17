const requestFormsData = require("./requestForms.data");
const sendEmail = require("../../utils/sendEmail");
const travelAuthoritiesData = require('../travelAuthorities/travelAuthorities.data');
const fs = require('fs/promises');
const path = require('path');
const { generateTripId } = require("../../utils/idGenerator");
const prisma = require("../../utils/prisma");
const generateTicket = require("../../utils/generateTicket");
const socket = require("../../middlewares/socket-connection");

class RequestFormsServices {
  async createRequest(data, files) {
    console.log("createRequest hit!", { hasFiles: !!(files && files.length), requestId: data.requestId });
    
    if (!data.requestedBy || !data.email) {
      throw new Error("Missing required fields: requestedBy and email");
    }

    console.log("[DEBUG] prisma.requestForm exists at runtime:", !!prisma.requestForm);
    
    // Generate requestId immediately
    const requestId = await generateTripId(prisma.requestForm, "requestId");
    data.requestId = requestId;

    if (files && files.length > 0) {
      const attachmentsPath = process.env.ATTACHMENTS_PATH || "C:/Attachments";
      const targetDir = path.join(attachmentsPath, requestId);
      
      console.log("Saving attachments to:", targetDir);
      
      try {
        await fs.mkdir(targetDir, { recursive: true });
        
        const filePaths = [];
        for (const file of files) {
          const targetPath = path.join(targetDir, file.originalname);
          // Use copy + unlink to be safer on Windows across volumes
          await fs.copyFile(file.path, targetPath);
          await fs.unlink(file.path);
          filePaths.push(targetPath);
        }
        
        data.attachments = filePaths;
        console.log("Attachments saved successfully:", filePaths.length, "files");

        // Try to save to database
        try {
          return await requestFormsData.createRequest(data);
        } catch (dbError) {
          // DATABASE FAIL: CLEAN UP ATTACHMENTS
          console.error("Database error! Cleaning up attachments in:", targetDir);
          try {
            await fs.rm(targetDir, { recursive: true, force: true });
          } catch (cleanupErr) {
            console.error("Failed to cleanup attachments after DB error:", cleanupErr);
          }
          throw dbError; // Rethrow to show error in API
        }
      } catch (err) {
        console.error("Error moving/saving attachments:", err);
        // If it was a DB error rethrown, don't fallback, just rethrow
        if (err.code || err.message.includes("prisma")) throw err;
        
        // Fallback for file system errors
        data.attachments = files.map(f => f.path);
      }
    }

    const result = await requestFormsData.createRequest(data);
    try {
      socket.getIO().emit("new-trip-request", { type: "CREATE", request: result });
    } catch (err) {
      console.error("Socket emit failed:", err.message);
    }
    return result;
  }

  async updateRequest(id, data) {
    const originalRequest = await requestFormsData.getRequestById(id);
    if (!originalRequest) {
      throw new Error("Request Form not found");
    }

    // Generate requestId if status changes to approved or rejected and it doesn't have one yet
    if (data.status && data.status !== originalRequest.status && !originalRequest.requestId) {
      if (data.status === "approved" || data.status === "rejected") {
        data.requestId = await generateTripId(prisma.requestForm, "requestId");
      }
    }

    const updatedRequest = await requestFormsData.updateRequest(id, data);

    // Send email and create travels record if status changed to approved or rejected
    if (data.status && data.status !== originalRequest.status) {
      let syncPassed = true;
      const lowerStatus = (data.status || "").toLowerCase();

      // IF APPROVED: CREATE TRAVEL RECORD
      if (lowerStatus === "approved") {
        try {
          const travelsData = require("../travels/travels.data"); // Lazy require to avoid circularity if any
          // Check if travel record already exists
          const existingTravel = await prisma.travels.findFirst({
            where: { requestFormId: updatedRequest.id }
          });
          
          if (!existingTravel) {
            await travelsData.createTravelFromRequest(updatedRequest);
            console.log(`[SYNC] Created travels record for Request ID: ${updatedRequest.id} (${updatedRequest.requestId})`);
          }
        } catch (travErr) {
          syncPassed = false;
          console.error(`[SYNC] CRITICAL: Failed to create travels record for Request ID: ${updatedRequest.id}. TICKET ABORTED.`, travErr);
        }
      }

      // ONLY ATTEMPT TO SAVE TICKET/SEND EMAIL IF SYNC PASSED (for approved) or if it's rejected
      if (syncPassed && (lowerStatus === 'approved' || lowerStatus === 'rejected')) {
        const subject = `Trip Request ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`;
        let text = `Your trip request to ${updatedRequest.destination} has been ${data.status}.
      
Remarks: ${updatedRequest.remarks || "No remarks provided"}
Date: ${updatedRequest.departureDate.toLocaleDateString()}
${data.status === 'approved' ? 'A driver and vehicle have been assigned to your trip. Attached is your Trip Ticket.' : ''}`;

        const attachments = [];
        try {
          // Fetch dynamic travel authority
          const authority = await travelAuthoritiesData.getFirstAuthority();
          let signatureBase64 = null;
          
          const signaturePath = authority?.signaturePath || process.env.SIGNATURE_LOCATION;
          if (signaturePath) {
            try {
              const signatureBuffer = await fs.readFile(signaturePath);
              signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;
            } catch (err) {
              console.error("Failed to read signature file:", err);
            }
          }

          const pdfBuffer = await generateTicket({
            requestId: updatedRequest.requestId,
            date: new Date().toLocaleDateString('en-PH'),
            departureDate: updatedRequest.departureDate.toLocaleDateString('en-PH'),
            departureTime: updatedRequest.departureTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
            arrivalDate: updatedRequest.arrivalDate.toLocaleDateString('en-PH'),
            arrivalTime: updatedRequest.arrivalTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
            destination: updatedRequest.destination,
            remarks: updatedRequest.remarks,
            purpose: updatedRequest.purpose,
            requestedBy: updatedRequest.requestedBy,
            driverName: updatedRequest.drivers?.name || "N/A",
            vehicleName: updatedRequest.vehicles?.vehicleName || "N/A",
            plateNumber: updatedRequest.vehicles?.plateNumber || "N/A",
            fuel: "",
            passengers: updatedRequest.authorizedPassengers,
            authorityName: authority?.name || "RONNIE B. YOHAN",
            authorityPlantilla: authority?.plantilla || "ADMINISTRATIVE OFFICER V",
            authoritySignature: signatureBase64
          });

          // Store the ticket in the specified path with fallbacks
          const approvedPath = process.env.APPROVED_TICKETS_PATH || path.join(process.env.USERPROFILE, "Desktop/TRIP TICKETS/Tickets/Approved");
          const rejectedPath = process.env.REJECTED_TICKETS_PATH || path.join(process.env.USERPROFILE, "Desktop/TRIP TICKETS/Tickets/Rejected");
          
          const currentStatus = (updatedRequest.status || "").toLowerCase();
          const storageDir = currentStatus === 'approved' ? approvedPath : rejectedPath;

          console.log(`[DEBUG] Attempting to store ${currentStatus} ticket. storageDir: ${storageDir}`);

          if (storageDir) {
            try {
              await fs.mkdir(storageDir, { recursive: true });
              const fileName = `TripTicket_${updatedRequest.requestId || updatedRequest.id}.pdf`;
              const fullPath = path.join(storageDir, fileName);
              console.log(`[DEBUG] Saving PDF to: ${fullPath}`);
              await fs.writeFile(fullPath, pdfBuffer);
              console.log(`[DEBUG] PDF saved successfully at: ${fullPath}`);
            } catch (storageError) {
              console.error(`[DEBUG] Failed to store ${currentStatus} ticket in ${storageDir}:`, storageError);
            }
          }

          attachments.push({
            filename: `TripTicket_${updatedRequest.requestId}.pdf`,
            content: pdfBuffer
          });
        } catch (pdfError) {
          console.error("Failed to generate PDF:", pdfError);
        }

        try {
          await sendEmail(updatedRequest.email, subject, text, null, attachments);
        } catch (error) {
          console.error("Failed to send notification email:", error);
        }
      }
    }

    const finalResult = await requestFormsData.updateRequest(id, data);
    try {
      socket.getIO().emit("new-trip-request", { type: "UPDATE", request: finalResult });
    } catch (err) {}
    return finalResult;
  }

  async getRequestById(id) {
    return await requestFormsData.getRequestById(id);
  }

  async getAllRequests() {
    return await requestFormsData.getAllRequests();
  }
}

module.exports = new RequestFormsServices();
