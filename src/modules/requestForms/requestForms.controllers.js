const requestFormsServices = require("./requestForms.services");
const { convertDatesToPhilippineTime } = require("../../utils/dateHelper")

class RequestFormsControllers {
  async createRequest(req, res, next) {
    try {
      const request = await requestFormsServices.createRequest(req.body, req.files);
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
}

module.exports = new RequestFormsControllers();
