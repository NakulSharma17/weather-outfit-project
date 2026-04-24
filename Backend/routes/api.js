// routes/api.js
// Defines all API endpoints for the application

const express = require("express");
const router = express.Router();
const axios = require("axios");
const UserPreference = require("../models/UserPreference");
const { generateOutfits } = require("../controllers/outfitController");

// ============================================================
// ROUTE 1: GET /api/weather?city=London&sessionId=abc
// Fetches weather from OpenWeather and returns outfit suggestions
// ============================================================
router.get("/weather", async (req, res) => {
  try {
    const { city, lat, lon, sessionId } = req.query;

    // Validate: need either city name OR coordinates
    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        error: "Please provide a city name or coordinates (lat & lon).",
      });
    }

    // Build the OpenWeather API URL
    const apiKey = process.env.OPENWEATHER_API_KEY;
    let weatherUrl;

    if (city) {
      // Search by city name
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    } else {
      // Search by GPS coordinates (for "use my location" feature)
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    }

    // Fetch weather data from OpenWeather
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    // Get user's style preference from DB (default to "casual" if not found)
    let userStyle = "casual";
    if (sessionId) {
      const userPref = await UserPreference.findOne({ sessionId });
      if (userPref) {
        userStyle = userPref.style;
        // Update last searched city
        await UserPreference.findOneAndUpdate(
          { sessionId },
          { lastCity: weatherData.name, $inc: { visitCount: 1 } }
        );
      }
    }

    // Generate outfit suggestions based on weather + user style
    const outfitSuggestions = generateOutfits(weatherData, userStyle);

    // Send back combined response
    res.json({
      success: true,
      city: weatherData.name,
      country: weatherData.sys.country,
      weather: {
        temp: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        windSpeed: weatherData.wind.speed,
        condition: weatherData.weather[0].main,
      },
      outfits: outfitSuggestions,
      userStyle,
    });
  } catch (error) {
    // Handle specific OpenWeather errors
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return res.status(404).json({ error: "City not found. Please check the spelling." });
      }
      if (status === 401) {
        return res.status(401).json({ error: "Invalid API key. Check your .env file." });
      }
    }
    console.error("Weather fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch weather data. Try again." });
  }
});

// ============================================================
// ROUTE 2: POST /api/preferences
// Saves or updates user's style/gender preferences in MongoDB
// ============================================================
router.post("/preferences", async (req, res) => {
  try {
    const { sessionId, style, gender } = req.body;

    // Validate required fields
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }

    const validStyles = ["casual", "formal", "sporty", "streetwear"];
    const validGenders = ["male", "female", "unisex"];

    if (style && !validStyles.includes(style)) {
      return res.status(400).json({ error: `Style must be one of: ${validStyles.join(", ")}` });
    }

    // Use findOneAndUpdate to either CREATE or UPDATE the preference
    // "upsert: true" means: create if not exists, update if exists
    const updatedPref = await UserPreference.findOneAndUpdate(
      { sessionId }, // Find by sessionId
      { style, gender }, // Update these fields
      {
        new: true, // Return the updated document
        upsert: true, // Create if not found
        runValidators: true, // Run schema validation
      }
    );

    res.json({
      success: true,
      message: "Preferences saved!",
      preferences: updatedPref,
    });
  } catch (error) {
    console.error("Preferences save error:", error.message);
    res.status(500).json({ error: "Failed to save preferences." });
  }
});

// ============================================================
// ROUTE 3: GET /api/preferences/:sessionId
// Retrieves saved preferences for a session
// ============================================================
router.get("/preferences/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const pref = await UserPreference.findOne({ sessionId });

    if (!pref) {
      // Return defaults if no preferences saved yet
      return res.json({
        success: true,
        preferences: { style: "casual", gender: "unisex" },
      });
    }

    res.json({ success: true, preferences: pref });
  } catch (error) {
    console.error("Preferences fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch preferences." });
  }
});

// ============================================================
// ROUTE 4: GET /api/health
// Simple health check to confirm server is running
// ============================================================
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;