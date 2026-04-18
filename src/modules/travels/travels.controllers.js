const travelsServices = require("./travels.services");

class TravelsControllers {
  async handleRfidEvent(req, res, next) {
    try {
      const { rfidNo } = req.body;
      const result = await travelsServices.handleRfidEvent(rfidNo);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTravels(req, res, next) {
    try {
      const travels = await travelsServices.getAllTravels();
      res.status(200).json({
        success: true,
        data: travels,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTravel(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await travelsServices.updateTravel(id, data);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTravel(req, res, next) {
    try {
      const { id } = req.params;
      const result = await travelsServices.deleteTravel(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req, res, next) {
    try {
      const { reportType, filterType, from, to, driverId } = req.query;
      const pdfBuffer = await travelsServices.generateReport({ reportType, filterType, from, to, driverId });
      
      const filename = `${reportType}_report_${new Date().getTime()}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async generateExcelReport(req, res, next) {
    try {
      const { filterType, from, to, driverId } = req.query;
      const excelBuffer = await travelsServices.generateExcelReport({ filterType, from, to, driverId });
      
      const filename = `travel_ticket_report_${new Date().getTime()}.xlsx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TravelsControllers();
