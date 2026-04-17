const router = require("express").Router();
const settingsController = require("./settings.controller");
const authMiddleware = require("../../middlewares/auth-middleware");

router.get("/paths", authMiddleware, settingsController.getPaths);
router.put("/paths", authMiddleware, settingsController.updatePaths);

module.exports = router;
