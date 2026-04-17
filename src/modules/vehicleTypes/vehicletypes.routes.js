const express = require("express");
const router = express.Router();
const vehicleTypesController = require("./vehicletypes.controller");

router.post("/", vehicleTypesController.createVehicleType);
router.get("/", vehicleTypesController.getAllVehicleTypes);
router.get("/:id", vehicleTypesController.getVehicleTypeById);
router.patch("/:id", vehicleTypesController.updateVehicleType);
router.delete("/:id", vehicleTypesController.deleteVehicleType);

module.exports = router;
