const express = require("express");
const router = express.Router();
const vehiclesController = require("./vehicles.controllers");

router.post("/", vehiclesController.createVehicle);
router.get("/", vehiclesController.getAllVehicles);
router.get("/:id", vehiclesController.getVehicleById);
router.patch("/:id", vehiclesController.updateVehicle);
router.delete("/:id", vehiclesController.deleteVehicle);

module.exports = router;
