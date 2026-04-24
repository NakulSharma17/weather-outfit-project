// js/app.js
// Frontend logic: handles user input, API calls, and DOM updates

// ============================================================
// CONFIGURATION
// ============================================================

// Backend URL — change this when deploying to production
const API_BASE_URL = "http://localhost:5000/api";

// ============================================================
// SESSION MANAGEMENT
// We use sessionStorage to remember user preferences during the visit
// ============================================================

/**
 * Generates a random session ID for anonymous preference tracking
 * This lets us save preferences in MongoDB without requiring login
 */
function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem("stylecast_session");
  if (!sessionId) {
    // Create a simple random ID using timestamp + random number
    sessionId = "sc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("stylecast_session", sessionId);
  }
  return sessionId;
}

const SESSION_ID = getOrCreateSessionId();

// ============================================================
// STATE — track current selections
// ============================================================
let selectedStyle = "casual";   // Default style preference
let selectedGender = "unisex";  // Default gender preference

// ============================================================
// DOM ELEMENT REFERENCES
// Grab all the elements we'll need to manipulate
// ============================================================
const cityInput        = document.getElementById("cityInput");
const locationBtn      = document.getElementById("locationBtn");
const getOutfitsBtn    = document.getElementById("getOutfitsBtn");
const errorBanner      = document.getElementById("errorBanner");
const errorText        = document.getElementById("errorText");
const weatherSection   = document.getElementById("weatherSection");
const outfitsSection   = document.getElementById("outfitsSection");
const outfitGrid       = document.getElementById("outfitGrid");
const stylePills       = document.getElementById("stylePills");
const genderPills      = document.getElementById("genderPills");

// ============================================================
// PILL SELECTION LOGIC
// Handle style and gender pill buttons
// ============================================================

/**
 * Sets up click handlers for a group of pill buttons
 * @param {HTMLElement} container - The parent element containing pills
 * @param {Function} onSelect - Callback when a pill is selected
 */
function setupPills(container, onSelect) {
  container.querySelectorAll(".pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      // Remove "active" from all pills in this group
      container.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      // Add "active" to the clicked pill
      pill.classList.add("active");
      // Call the callback with the selected value
      onSelect(pill.dataset.style || pill.dataset.gender);
    });
  });
}

// Set up style pills (casual, formal, sporty, streetwear)
setupPills(stylePills, (style) => {
  selectedStyle = style;
  savePreferences(); // Auto-save to backend when user changes style
});

// Set up gender pills (unisex, male, female)
setupPills(genderPills, (gender) => {
  selectedGender = gender;
  savePreferences(); // Auto-save to backend
});

// ============================================================
// PREFERENCES — Save/Load from backend
// ============================================================

/**
 * Saves current style and gender preferences to the backend (MongoDB)
 * Called automatically when pills are clicked
 */
async function savePreferences() {
  try {
    const response = await fetch(`${API_BASE_URL}/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        style: selectedStyle,
        gender: selectedGender,
      }),
    });
    // We don't need to do anything with the response here
    const data = await response.json();
    if (!data.success) {
      console.warn("Preferences not saved:", data.error);
    }
  } catch (err) {
    // Fail silently — preferences saving is non-critical
    console.warn("Could not save preferences:", err.message);
  }
}

/**
 * Loads saved preferences from the backend on page load
 * Restores pill selections if user has visited before
 */
async function loadPreferences() {
  try {
    const response = await fetch(`${API_BASE_URL}/preferences/${SESSION_ID}`);
    const data = await response.json();

    if (data.success && data.preferences) {
      const { style, gender } = data.preferences;

      // Update selected state
      selectedStyle = style || "casual";
      selectedGender = gender || "unisex";

      // Visually activate the correct pills
      activatePill(stylePills, "style", selectedStyle);
      activatePill(genderPills, "gender", selectedGender);
    }
  } catch (err) {
    // Fail silently — not critical
    console.warn("Could not load preferences:", err.message);
  }
}

/**
 * Visually activates a specific pill by its data attribute value
 * @param {HTMLElement} container - Pills container
 * @param {string} attrName - data attribute name (style or gender)
 * @param {string} value - Value to activate
 */
function activatePill(container, attrName, value) {
  container.querySelectorAll(".pill").forEach((p) => {
    p.classList.toggle("active", p.dataset[attrName] === value);
  });
}

// ============================================================
// MAIN FUNCTION: Fetch weather + outfits
// ============================================================

/**
 * Called when user clicks "Get My Outfit"
 * Reads city input, calls the backend, and renders results
 */
async function fetchWeatherAndOutfits(lat = null, lon = null) {
  const city = cityInput.value.trim();

  // Validate: need city OR coordinates
  if (!city && (!lat || !lon)) {
    showError("Please enter a city name or click 'Use Location'.");
    return;
  }

  // Show loading state
  setLoading(true);
  hideError();
  hideResults();

  try {
    // Build the API URL with query parameters
    let url = `${API_BASE_URL}/weather?sessionId=${SESSION_ID}`;
    if (city) {
      url += `&city=${encodeURIComponent(city)}`;
    } else {
      url += `&lat=${lat}&lon=${lon}`;
    }

    // Call our backend (which calls OpenWeather internally)
    const response = await fetch(url);
    const data = await response.json();

    // Handle API errors (city not found, bad key, etc.)
    if (!response.ok || !data.success) {
      showError(data.error || "Something went wrong. Please try again.");
      return;
    }

    // Render weather info and outfit cards
    renderWeather(data);
    renderOutfits(data);

    // Smooth scroll to results
    weatherSection.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (err) {
    // Network error or server down
    showError("Could not connect to server. Make sure the backend is running on port 5000.");
    console.error("Fetch error:", err);
  } finally {
    // Always restore the button
    setLoading(false);
  }
}

// ============================================================
// RENDER FUNCTIONS — Update the DOM with received data
// ============================================================

/**
 * Populates the weather card with data from the API
 * @param {object} data - API response containing weather info
 */
function renderWeather(data) {
  const { weather, city, country, outfits } = data;

  // Set weather card content using DOM manipulation (no innerHTML for values)
  document.getElementById("weatherCity").textContent = `${city}, ${country}`;
  document.getElementById("weatherTemp").textContent = `${weather.temp}°C`;
  document.getElementById("weatherDesc").textContent = weather.description;
  document.getElementById("weatherSeason").textContent = getSeasonEmoji(outfits.season);
  document.getElementById("feelsLike").textContent = `${weather.feelsLike}°C`;
  document.getElementById("humidity").textContent = `${weather.humidity}%`;
  document.getElementById("windSpeed").textContent = `${weather.windSpeed} m/s`;

  // Set weather icon from OpenWeather CDN
  const iconEl = document.getElementById("weatherIcon");
  iconEl.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  iconEl.alt = weather.description;

  // Show humidity tip if available
  const humidityTip = document.getElementById("humidityTip");
  if (outfits.humidityTip) {
    humidityTip.textContent = outfits.humidityTip;
    humidityTip.style.display = "block";
  } else {
    humidityTip.style.display = "none";
  }

  // Reveal the weather section
  weatherSection.style.display = "block";
}

/**
 * Creates outfit cards and injects them into the grid
 * @param {object} data - API response containing outfit suggestions
 */
function renderOutfits(data) {
  const { outfits, userStyle } = data;

  // Update subtitle with context
  const subtitleEl = document.getElementById("outfitSubtitle");
  subtitleEl.textContent = `${capitalize(userStyle)} looks for ${outfits.season} · ${capitalize(outfits.tempCategory)} weather`;

  // Clear previous cards
  outfitGrid.innerHTML = "";

  // Create a card for each outfit suggestion
  outfits.outfits.forEach((outfit, index) => {
    const card = createOutfitCard(outfit, index);
    outfitGrid.appendChild(card);
  });

  // Reveal the outfits section
  outfitsSection.style.display = "block";
}

/**
 * Creates a single outfit card DOM element
 * @param {object} outfit - Outfit data (name, items, icon, color, tip)
 * @param {number} index - Card index for staggered animation
 * @returns {HTMLElement} - The card element
 */
function createOutfitCard(outfit, index) {
  // Create the main card div
  const card = document.createElement("div");
  card.className = "outfit-card";
  // Use the outfit's color as the CSS variable for the accent bar
  card.style.setProperty("--card-color", outfit.color);
  // Stagger animation delay based on index
  card.style.animationDelay = `${index * 0.1}s`;

  // Build the items list HTML
  const itemsHTML = outfit.items
    .map((item) => `<li>${item}</li>`)
    .join("");

  // Set the card's inner HTML
  card.innerHTML = `
    <span class="outfit-icon">${outfit.icon}</span>
    <div class="outfit-name">${outfit.name}</div>
    <ul class="outfit-items">
      ${itemsHTML}
    </ul>
    <div class="outfit-tip">💡 ${outfit.tip}</div>
  `;

  return card;
}

// ============================================================
// GEOLOCATION — "Use My Location" feature
// ============================================================

/**
 * Uses the browser's Geolocation API to get the user's coordinates
 * Then passes them to fetchWeatherAndOutfits()
 */
function useCurrentLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  locationBtn.textContent = "📡 Getting location...";
  locationBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      // Success: got coordinates
      const { latitude, longitude } = position.coords;
      locationBtn.textContent = "📡 Use Location";
      locationBtn.disabled = false;
      // Clear city input since we're using coordinates
      cityInput.value = "";
      // Fetch weather using coordinates
      fetchWeatherAndOutfits(latitude, longitude);
    },
    (error) => {
      // Error: user denied permission or other issue
      locationBtn.textContent = "📡 Use Location";
      locationBtn.disabled = false;
      let msg = "Could not get your location.";
      if (error.code === error.PERMISSION_DENIED) {
        msg = "Location access denied. Please enter city manually.";
      }
      showError(msg);
    }
  );
}

// ============================================================
// UI HELPERS
// ============================================================

/** Shows an error message in the error banner */
function showError(message) {
  errorText.textContent = message;
  errorBanner.style.display = "flex";
}

/** Hides the error banner */
function hideError() {
  errorBanner.style.display = "none";
}

/** Hides weather and outfit sections */
function hideResults() {
  weatherSection.style.display = "none";
  outfitsSection.style.display = "none";
}

/** Shows/hides loading state on the main button */
function setLoading(isLoading) {
  const btnText   = getOutfitsBtn.querySelector(".btn-text");
  const btnLoader = getOutfitsBtn.querySelector(".btn-loader");
  getOutfitsBtn.disabled = isLoading;
  btnText.style.display   = isLoading ? "none"   : "inline";
  btnLoader.style.display = isLoading ? "inline" : "none";
}

/**
 * Returns a season string with emoji
 * @param {string} season - Season name
 */
function getSeasonEmoji(season) {
  const map = { Spring: "🌸 Spring", Summer: "☀️ Summer", Autumn: "🍂 Autumn", Winter: "❄️ Winter" };
  return map[season] || season;
}

/** Capitalizes the first letter of a string */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// EVENT LISTENERS
// ============================================================

// Main button click
getOutfitsBtn.addEventListener("click", () => {
  fetchWeatherAndOutfits();
});

// Allow pressing Enter in the city input
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    fetchWeatherAndOutfits();
  }
});

// Location button click
locationBtn.addEventListener("click", useCurrentLocation);

// ============================================================
// INIT — Run on page load
// ============================================================

/**
 * Initialize the app:
 * 1. Load saved preferences from backend
 * 2. Focus the city input
 */
async function init() {
  await loadPreferences();
  cityInput.focus();
}

// Start the app
init();

// Make hideError accessible from HTML onclick attribute
window.hideError = hideError;