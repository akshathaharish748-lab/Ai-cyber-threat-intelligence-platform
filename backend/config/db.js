const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn("MONGO_URI is not set. Skipping MongoDB connection in this environment.");
            return null;
        }

        console.log("Connecting to MongoDB...");
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log(
            `MongoDB connected: ${connection.connection.host}`
        );

        return connection;

    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);
        throw error;
    }
};

module.exports = connectDB;