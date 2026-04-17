const vehicleLogsServices = require("./vehicleLogs.services");

const recordScan = async (req, res, next) => {
  const { rfidNo } = req.body;
  try {
    const result = await vehicleLogsServices.recordScanByRFID(rfidNo);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
    // next(err) // We want to handle it specifically for the scanner UI
  }
};

const getLogs = async (req, res, next) => {
  try {
    const result = await vehicleLogsServices.getAttendanceToday();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getAllLogs = async (req, res, next) => {
  try {
    const result = await vehicleLogsServices.getAllLogs();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { recordScan, getLogs, getAllLogs };
