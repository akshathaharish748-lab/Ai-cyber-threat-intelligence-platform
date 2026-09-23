const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const threatRoutes = require("./routes/threatRoutes");
const aiRoutes = require("./routes/aiRoutes");
const reportRoutes = require("./routes/reportRoutes");
const intelRoutes = require("./routes/intelRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
});

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));
app.use(apiLimiter);

// Authentication routes
app.use("/api/auth", authRoutes);

// Threat routes
app.use("/api/threats", threatRoutes);
app.use("/api/ai-assistant", aiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/intel", intelRoutes);

// Health and monitoring endpoints
app.get("/", (req, res) => {
    res.json({
        message: "AI Cyber Threat Intelligence Backend is running!"
    });
});

app.get("/api/health", (req, res) => {
    const health = {
        status: "ok",
        service: "ai-cyber-threat-intelligence-backend",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
    };

    res.json(health);
});

app.get("/api/health/ready", async (req, res) => {
    const readiness = {
        status: "ready",
        database: "connected",
        timestamp: new Date().toISOString(),
    };

    res.json(readiness);
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Backend startup failed:", error.message);
        process.exitCode = 1;
    }
};

if (process.env.NODE_ENV !== "test") {
    startServer();
}

module.exports = app;