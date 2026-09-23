const Report = require("../models/Report");
const mongoose = require("mongoose");

const createReport = async (req, res) => {
  try {
    const { threatId, name, type, indicator, risk, score, reason, description, status } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: "Report name and type are required" });
    }

    const report = await Report.create({
      userId: req.user.userId,
      threatId: threatId && mongoose.Types.ObjectId.isValid(threatId) ? threatId : null,
      name,
      type,
      status: status || "Completed",
      indicator: indicator || "",
      risk: risk || "Low",
      score: Number(score) || 0,
      reason: reason || "",
      description: description || "",
    });

    return res.status(201).json({ success: true, message: "Report created", report });
  } catch (error) {
    console.error("Create report error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to create report", error: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    console.error("Get reports error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch reports", error: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, indicator, risk, score, reason, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid report ID" });
    }

    const report = await Report.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      {
        $set: {
          name: name || "Security Report",
          type: type || "Threat Detection",
          indicator: indicator || "",
          risk: risk || "Low",
          score: Number(score) || 0,
          reason: reason || "",
          description: description || "",
          status: status || "Completed",
        },
      },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    return res.status(200).json({ success: true, message: "Report updated", report });
  } catch (error) {
    console.error("Update report error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update report", error: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid report ID" });
    }

    const report = await Report.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    return res.status(200).json({ success: true, message: "Report deleted" });
  } catch (error) {
    console.error("Delete report error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete report", error: error.message });
  }
};

module.exports = { createReport, getReports, updateReport, deleteReport };
