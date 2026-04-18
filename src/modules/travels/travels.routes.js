const express = require("express");
const router = express.Router();
const travelsControllers = require("./travels.controllers");

router.post("/rfid-event", travelsControllers.handleRfidEvent);
router.get("/", travelsControllers.getAllTravels);
router.get("/generate-report", travelsControllers.generateReport);
router.get("/generate-excel", travelsControllers.generateExcelReport);
router.put("/:id", travelsControllers.updateTravel);
router.delete("/:id", travelsControllers.deleteTravel);

module.exports = router;
