const express = require("express");
const { checkIntel } = require("../controllers/intelController");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/check", requireAuth, checkIntel);

module.exports = router;
