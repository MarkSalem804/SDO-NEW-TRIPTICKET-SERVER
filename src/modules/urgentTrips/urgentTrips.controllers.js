const urgentTripsServices = require("./urgentTrips.services");

const recordUrgentScan = async (req, res, next) => {
  const { rfidNo } = req.body;
  try {
    const result = await urgentTripsServices.recordUrgentScan(rfidNo);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getTodayUrgentTrips = async (req, res, next) => {
  try {
    const result = await urgentTripsServices.getTodayUrgentTrips();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getAllUrgentTrips = async (req, res, next) => {
  try {
    const result = await urgentTripsServices.getAllUrgentTrips();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { recordUrgentScan, getTodayUrgentTrips, getAllUrgentTrips };
