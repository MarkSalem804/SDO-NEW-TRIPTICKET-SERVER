const officesService = require("./offices.service");

class OfficesController {
  async getOffices(req, res, next) {
    try {
      const offices = await officesService.getAllOffices();
      return res.status(200).json(offices);
    } catch (err) {
      next(err);
    }
  }

  async createOffice(req, res, next) {
    try {
      const office = await officesService.createOffice(req.body);
      return res.status(201).json(office);
    } catch (err) {
      next(err);
    }
  }

  async updateOffice(req, res, next) {
    try {
      const { id } = req.params;
      const office = await officesService.updateOffice(id, req.body);
      return res.status(200).json(office);
    } catch (err) {
      next(err);
    }
  }

  async deleteOffice(req, res, next) {
    try {
      const { id } = req.params;
      await officesService.deleteOffice(id);
      return res.status(200).json({ message: "Office deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OfficesController();
