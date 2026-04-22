const express = require("express");
const router = express.Router();
const requestFormsControllers = require("./requestForms.controllers");
const upload = require("../../utils/upload");

router.post("/", upload.array("attachments", 10), requestFormsControllers.createRequest);
router.get("/", requestFormsControllers.getAllRequests);

// SECURITY: Specific routes must come BEFORE dynamic ID routes like /:id
router.get("/download-attachment", requestFormsControllers.downloadAttachment);

router.get("/:id", requestFormsControllers.getRequestById);
router.get("/:id/generate-ticket", requestFormsControllers.generateTicket);
router.patch("/:id", requestFormsControllers.updateRequest);

module.exports = router;
