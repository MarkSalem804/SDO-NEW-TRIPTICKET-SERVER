const express = require("express");
const router = express.Router();
const officesController = require("./offices.controller");

router.get("/", officesController.getOffices);
router.post("/", officesController.createOffice);
router.put("/:id", officesController.updateOffice);
router.delete("/:id", officesController.deleteOffice);

module.exports = router;
