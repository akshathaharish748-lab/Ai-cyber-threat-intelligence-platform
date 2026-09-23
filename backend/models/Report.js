const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    threatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Threat",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending"],
      default: "Completed",
    },
    indicator: {
      type: String,
      default: "",
      trim: true,
    },
    risk: {
      type: String,
      default: "Low",
      trim: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);
