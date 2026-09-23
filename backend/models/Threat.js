const mongoose = require("mongoose");

const threatSchema = new mongoose.Schema(
  {
    threatName: {
      type: String,
      required: true,
      trim: true,
    },

    threatType: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    indicator: {
      type: String,
      default: "",
      trim: true,
    },

    riskScore: {
      type: Number,
      default: 0,
    },

    riskReason: {
      type: String,
      default: "",
      trim: true,
    },

    aiResult: {
      type: String,
      default: "",
      trim: true,
    },

    detectedOn: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Active", "Resolved", "Investigating"],
      default: "Active",
    },

    source: {
      type: String,
      default: "AI Threat Detection System",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Threat", threatSchema);