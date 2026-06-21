const express = require("express");
const router = express.Router();
const controllers = require("./urgentTrips.controllers");

router.post("/scan", controllers.recordUrgentScan);
router.get("/recent", controllers.getTodayUrgentTrips);
router.get("/all", controllers.getAllUrgentTrips);

module.exports = router;
