const requestFormsServices = require("./requestForms.services");
const { convertDatesToPhilippineTime } = require("../../utils/dateHelper")
const socket = require("../../middlewares/socket-connection");

class RequestFormsControllers {
  async createRequest(req, res, next) {
    try {
      const request = await requestFormsServices.createRequest(req.body, req.files);
      socket.getIO().emit("new-trip-request", { type: "CREATE", request });
      res.status(201).json({
        success: true,
        message: "Trip request created successfully",
        data: convertDatesToPhilippineTime(request),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRequest(req, res, next) {
    try {
      const { id } = req.params;
      const updatedRequest = await requestFormsServices.updateRequest(id, req.body);
      socket.getIO().emit("new-trip-request", { type: "UPDATE", request: updatedRequest });
      res.status(200).json({
        success: true,
        message: "Trip request updated successfully",
        data: updatedRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRequestById(req, res, next) {
    try {
      const { id } = req.params;
      const request = await requestFormsServices.getRequestById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request Form not found",
        });
      }
      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllRequests(req, res, next) {
    try {
      const requests = await requestFormsServices.getAllRequests();
      res.status(200).json(requests);
    } catch (error) {
      next(error);
    }
  }

  async generateTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { pdfBuffer, requestId } = await requestFormsServices.generateTicketById(id);
      
      const filename = `TripTicket_${requestId || id}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async downloadAttachment(req, res, next) {
    try {
      const { requestId, fileName } = req.query;
      const fs = require('fs');
      const path = require('path');

      if (!requestId || !fileName) {
        return res.status(400).json({ success: false, message: "requestId and fileName are required" });
      }

      const attachmentsPath = process.env.ATTACHMENTS_PATH || 'uploads';
      
      // Construct the absolute path and the base directory for security validation
      const baseDir = path.resolve(attachmentsPath);
      const originalPath = path.resolve(baseDir, requestId, fileName);

      console.log(`[ATTACHMENT_DEBUG] Attempting to access: "${originalPath}"`);

      // SECURITY: Ensure the requested file is actually inside the authorized attachments directory
      if (!originalPath.startsWith(baseDir)) {
        console.warn(`[SECURITY_ALERT] Blocked unauthorized path traversal attempt: "${originalPath}"`);
        return res.status(403).json({ success: false, message: "Unauthorized access" });
      }

      if (!fs.existsSync(originalPath)) {
        console.error(`[ATTACHMENT_ERROR] File not found: "${originalPath}"`);
        return res.status(404).json({ success: false, message: "File not found on system" });
      }

      const absoluteFilePath = path.resolve(originalPath);
      
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
      
      res.sendFile(absoluteFilePath, (err) => {
        if (err) {
          console.error(`[res.sendFile Error] for path "${absoluteFilePath}":`, err);
          if (!res.headersSent) {
            res.status(err.status || 500).end();
          }
        }
      });
    } catch (error) {
      console.error("Attachment View Error:", error);
      next(error);
    }
  }
}

module.exports = new RequestFormsControllers();
