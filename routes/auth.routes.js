const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected
router.get("/profile", authController.profile);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
