// models/UserPreference.js
// MongoDB schema for storing user outfit style preferences

const mongoose = require("mongoose");

// Define the shape of our data in the database
const UserPreferenceSchema = new mongoose.Schema(
  {
    // User identifier (using sessionId since we have no auth)
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    // Style preference: casual, formal, sporty, or streetwear
    style: {
      type: String,
      enum: ["casual", "formal", "sporty", "streetwear"],
      default: "casual",
    },

    // Gender preference affects outfit suggestions
    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "unisex",
    },

    // Last city searched by user
    lastCity: {
      type: String,
      default: "",
    },

    // Track how many times user has visited
    visitCount: {
      type: Number,
      default: 1,
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  }
);

// Export the model so we can use it in other files
module.exports = mongoose.model("UserPreference", UserPreferenceSchema);