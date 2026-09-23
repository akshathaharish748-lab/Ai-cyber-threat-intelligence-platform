const express = require("express");
const { signup, login, changePassword, googleStart, googleCallback } = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

// Change password for the authenticated user
router.post("/change-password", requireAuth, changePassword);

router.get("/google", googleStart);
router.get("/google/callback", googleCallback);

module.exports = router;