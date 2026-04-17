const router = require("express").Router();
const travelAuthoritiesController = require("./travelAuthorities.controllers");
const authMiddleware = require("../../middlewares/auth-middleware");

router.get("/", authMiddleware, travelAuthoritiesController.getAll);
router.get("/:id", authMiddleware, travelAuthoritiesController.getById);
router.post("/", authMiddleware, travelAuthoritiesController.create);
router.put("/:id", authMiddleware, travelAuthoritiesController.update);
router.delete("/:id", authMiddleware, travelAuthoritiesController.remove);

module.exports = router;
