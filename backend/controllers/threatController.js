const mongoose = require("mongoose");
const Threat = require("../models/Threat");
const axios = require("axios");

// =========================================================
// POST /api/threats
// CREATE + AI ANALYZE THREAT
// =========================================================
const createThreat = async (req, res) => {
  try {
    const {
      threatName,
      threatType,
      severity,
      description,
      indicator,
      riskScore,
      riskReason,
      aiResult: storedAiResult,
      detectedOn,
      status,
      source,
    } = req.body;

    let aiResult = {};

    try {
      const aiResponse = await axios.post(
        "http://127.0.0.1:5001/predict",
        {
          data: `${threatName || ""} ${threatType || ""} ${description || ""}`,
        },
        { timeout: 10000 }
      );
      aiResult = aiResponse.data || {};
    } catch (aiError) {
      console.warn("Python AI unavailable; using submitted threat calculation:", aiError.message);
    }

    // Create threat
    const threat = new Threat({
      threatName: threatName || "Unknown Threat",

      threatType: threatType || "Unknown",

      severity:
        severity ||
        aiResult.severity ||
        "Low",

      description:
        description || "",

      indicator: indicator || "",

      riskScore: Number(riskScore) || 0,

      riskReason: riskReason || "",

      aiResult: aiResult.result || storedAiResult || "",

      detectedOn:
        detectedOn ||
        new Date(),

      status:
        status ||
        "Investigating",

      source:
        source ||
        "AI Threat Detection System",
    });

    const savedThreat = await threat.save();

    res.status(201).json({
      success: true,
      message:
        "Threat analyzed and created successfully",

      aiResult: aiResult.result,

      threat: savedThreat,
    });

  } catch (error) {
    console.error(
      "Threat creation error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to analyze/create threat",
      error: error.message,
    });
  }
};


// =========================================================
// GET /api/threats
// GET ALL THREATS
// =========================================================
const getAllThreats = async (req, res) => {
  try {

    const threats = await Threat.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: threats.length,
      threats,
    });

  } catch (error) {

    console.error(
      "Get threats error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch threats",
      error: error.message,
    });
  }
};


// =========================================================
// GET /api/threats/:id
// GET SINGLE THREAT
// =========================================================
const getThreatById = async (req, res) => {
  try {

    const { id } = req.params;

    // Check MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid threat ID",
      });

    }

    const threat =
      await Threat.findById(id);

    if (!threat) {

      return res.status(404).json({
        success: false,
        message:
          "Threat not found",
      });

    }

    res.status(200).json({
      success: true,
      threat,
    });

  } catch (error) {

    console.error(
      "Get threat error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch threat",
      error: error.message,
    });
  }
};


// =========================================================
// POST /api/threats/:id/reanalyze
// AI RE-ANALYSIS
// =========================================================
const reanalyzeThreat = async (req, res) => {
  try {

    const { id } = req.params;

    console.log(
      "Starting AI re-analysis for:",
      id
    );

    // =====================================================
    // CHECK ID
    // =====================================================
    if (!id || id === "undefined") {

      return res.status(400).json({
        success: false,
        message:
          "Threat ID is missing",
      });

    }

    // =====================================================
    // CHECK MONGODB OBJECT ID
    // =====================================================
    if (!mongoose.Types.ObjectId.isValid(id)) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid MongoDB threat ID",
      });

    }

    // =====================================================
    // FIND THREAT
    // =====================================================
    const threat =
      await Threat.findById(id);

    if (!threat) {

      return res.status(404).json({
        success: false,
        message:
          "Threat not found",
      });

    }

    console.log(
      "Threat found:",
      threat._id
    );

    // =====================================================
    // SEND TO PYTHON AI
    // =====================================================
    const aiResponse =
      await axios.post(
        "http://127.0.0.1:5001/predict",
        {
          data: `${threat.threatName || ""} ${
            threat.threatType || ""
          } ${
            threat.description || ""
          }`,
        },
        {
          timeout: 10000,
        }
      );

    const aiResult =
      aiResponse.data;

    console.log(
      "AI response:",
      aiResult
    );

    // =====================================================
    // UPDATE SEVERITY
    // =====================================================
    if (aiResult.severity) {

      threat.severity =
        aiResult.severity;
    }

    // =====================================================
    // UPDATE STATUS IF THREAT DETECTED
    // =====================================================
    if (
      aiResult.result ===
      "Threat Detected"
    ) {

      threat.status = "Active";

    } else if (
      aiResult.result ===
      "No Threat"
    ) {

      threat.status = "Resolved";
    }

    // =====================================================
    // SAVE
    // =====================================================
    const updatedThreat =
      await threat.save();

    // =====================================================
    // RESPONSE
    // =====================================================
    res.status(200).json({
      success: true,

      message:
        "Threat re-analyzed successfully",

      aiResult:
        aiResult.result,

      severity:
        updatedThreat.severity,

      status:
        updatedThreat.status,

      threat:
        updatedThreat,
    });

  } catch (error) {

    console.error(
      "Threat re-analysis error:",
      error.message
    );

    // Python AI server not running
    if (
      error.code ===
      "ECONNREFUSED"
    ) {

      return res.status(503).json({
        success: false,
        message:
          "AI service is not running. Start python.py on port 5001.",
        error:
          error.message,
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to re-analyze threat",
      error:
        error.message,
    });
  }
};


// =========================================================
// PUT /api/threats/:id
// UPDATE THREAT
// =========================================================
const updateThreat = async (req, res) => {
  try {

    const { id } = req.params;

    // Check ID
    if (
      !id ||
      id === "undefined" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid threat ID",
      });

    }

    const threat =
      await Threat.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!threat) {

      return res.status(404).json({
        success: false,
        message:
          "Threat not found",
      });

    }

    res.status(200).json({
      success: true,
      message:
        "Threat updated successfully",
      threat,
    });

  } catch (error) {

    console.error(
      "Update threat error:",
      error.message
    );

    res.status(400).json({
      success: false,
      message:
        "Failed to update threat",
      error: error.message,
    });
  }
};


// =========================================================
// DELETE /api/threats/:id
// DELETE THREAT
// =========================================================
const deleteThreat = async (req, res) => {
  try {

    const { id } = req.params;

    // Check ID
    if (
      !id ||
      id === "undefined" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid threat ID",
      });

    }

    const threat =
      await Threat.findByIdAndDelete(id);

    if (!threat) {

      return res.status(404).json({
        success: false,
        message:
          "Threat not found",
      });

    }

    res.status(200).json({
      success: true,
      message:
        "Threat deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete threat error:",
      error.message
    );

    res.status(400).json({
      success: false,
      message:
        "Failed to delete threat",
      error: error.message,
    });
  }
};


// =========================================================
// EXPORT CONTROLLERS
// =========================================================
module.exports = {
  createThreat,
  getAllThreats,
  getThreatById,
  reanalyzeThreat,
  updateThreat,
  deleteThreat,
};