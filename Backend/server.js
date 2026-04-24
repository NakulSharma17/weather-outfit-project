// server.js
// Main entry point for the backend server

// Load environment variables from .env file FIRST (before anything else)
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const apiRoutes = require("./routes/api");

// Create the Express application
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// Middleware runs on every request before hitting routes
// ============================================================

// Allow requests from the frontend (CORS = Cross-Origin Resource Sharing)
app.use(
  cors({
    origin: [
      "https://weather-outfit-project.vercel.app",
      "http://localhost:5000",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the frontend folder

const path = require("path");


// ============================================================
// ROUTES
// All API routes are prefixed with /api
// ============================================================
app.use("/api", apiRoutes);

// Catch-all route: serve index.html for any non-API route
// Catch-all for undefined routes
app.get("/{*path}", (req, res) => {
  res.json({ message: "API is running. Frontend is on Vercel." });
});

// ============================================================
// DATABASE CONNECTION
// Connect to MongoDB before starting the server
// ============================================================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // These options prevent deprecation warnings
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if can't connect
    });
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("⚠️  Server will run without database (preferences won't be saved)");
    // Don't crash the server — let it run without DB for demo purposes
  }
};

// ============================================================
// START SERVER
// ============================================================
const startServer = async () => {
  // Try to connect to database
  await connectDB();

  // Start listening for HTTP requests
  app.listen(PORT, () => {
    console.log(`\n🌤️  Weather Outfit Server running on http://localhost:${PORT}`);
    console.log(`📡  API available at http://localhost:${PORT}/api`);
    console.log(`🔑  OpenWeather API Key: ${process.env.OPENWEATHER_API_KEY ? "✅ Set" : "❌ Missing!"}`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
  });
};

// Handle unexpected errors gracefully
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err.message);
});

// Start the application
startServer();