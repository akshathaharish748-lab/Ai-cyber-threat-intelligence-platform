const express = require("express");
const { createReport, getReports, updateReport, deleteReport } = require("../controllers/reportController");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, createReport);
router.get("/", requireAuth, getReports);
router.put("/:id", requireAuth, updateReport);
router.delete("/:id", requireAuth, deleteReport);

module.exports = router;
