const express = require("express");
const router = express.Router();
const requestFormsControllers = require("./requestForms.controllers");
const upload = require("../../utils/upload");

router.post("/", upload.array("attachments", 10), requestFormsControllers.createRequest);
router.patch("/:id", requestFormsControllers.updateRequest);
router.get("/", requestFormsControllers.getAllRequests);
router.get("/:id", requestFormsControllers.getRequestById);

module.exports = router;
