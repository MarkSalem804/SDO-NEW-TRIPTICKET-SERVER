const express = require("express");
const router = require("express").Router();
const usersController = require("./users.controllers");
const authMiddleware = require("../../middlewares/auth-middleware");
const rateLimiter = require("../../middlewares/rate-limiter");

// Rate Limiters Configuration
const loginLimiter = rateLimiter(15 * 60 * 1000, 6); // 1 free + 5 attempts per 15 mins

router.post("/register", usersController.register);
router.post("/login", loginLimiter, usersController.login);
router.post("/login-pin", loginLimiter, usersController.loginWithPin);
router.post("/verify-mfa", usersController.verifyOTP);
router.post("/resend-mfa", usersController.resendOTP);
router.post("/refresh", usersController.refresh);
router.post("/logout", usersController.logout);
router.get("/me", authMiddleware, usersController.getMe);
router.get("/get-all-users", authMiddleware, usersController.getAllUsers);

// Specific routes first
router.put("/profile", authMiddleware, usersController.updateProfile);
router.put("/change-password", authMiddleware, usersController.changePassword);

router.post("/mfa/enable", authMiddleware, usersController.enableMFA);
router.post("/mfa/disable", authMiddleware, usersController.disableMFA);
router.post("/enable-pincode", authMiddleware, usersController.enablePinCode);
router.post("/disable-pincode", authMiddleware, usersController.disablePinCode);
router.post("/set-pincode", authMiddleware, usersController.setPinCode);

// Dynamic ID routes last
router.get("/:id", authMiddleware, usersController.getUserById);
router.put("/:id", authMiddleware, usersController.updateUser);
router.delete("/:id", authMiddleware, usersController.deleteUser);
router.put("/deactivate/:id", authMiddleware, usersController.deactivateUser);
router.put("/activate/:id", authMiddleware, usersController.activateUser);
router.put("/reset-password/:id", authMiddleware, usersController.resetPassword);

module.exports = router;
