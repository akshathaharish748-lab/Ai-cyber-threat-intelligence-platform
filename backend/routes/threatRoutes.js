const express = require("express");

const {
  createThreat,
  getAllThreats,
  getThreatById,
  updateThreat,
  deleteThreat,
  reanalyzeThreat,
} = require("../controllers/threatController");

const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");

router.use(requireAuth);

// POST /api/threats
router.post("/", createThreat);

// GET /api/threats
router.get("/", getAllThreats);

// GET /api/threats/:id
router.get("/:id", getThreatById);

// POST /api/threats/:id/reanalyze
router.post("/:id/reanalyze", reanalyzeThreat);

// PUT /api/threats/:id
router.put("/:id", updateThreat);

// DELETE /api/threats/:id
router.delete("/:id", deleteThreat);

module.exports = router;