const express = require("express");
const router = express.Router();
const controllers = require("./vehicleLogs.controllers");

router.post("/scan", controllers.recordScan);
router.get("/recent", controllers.getLogs);
router.get("/all", controllers.getAllLogs);

module.exports = router;
