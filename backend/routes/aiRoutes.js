const express = require("express");
const { chat } = require("../controllers/aiController");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/chat", requireAuth, chat);

module.exports = router;
