// js/app.js — Wardrobe frontend logic (redesigned)

const API_BASE_URL = "http://localhost:5000/api";

// ---- Session ID ----
function getOrCreateSessionId() {
  let id = sessionStorage.getItem("wardrobe_session");
  if (!id) {
    id = "wb_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("wardrobe_session", id);
  }
  return id;
}
const SESSION_ID = getOrCreateSessionId();

// ---- State ----
let selectedStyle  = "casual";
let selectedGender = "unisex";

// ---- DOM refs ----
const cityInput     = document.getElementById("cityInput");
const locationBtn   = document.getElementById("locationBtn");
const getOutfitsBtn = document.getElementById("getOutfitsBtn");
const errorBanner   = document.getElementById("errorBanner");
const errorText     = document.getElementById("errorText");
const emptyState    = document.getElementById("emptyState");
const resultsWrap   = document.getElementById("resultsWrap");
const outfitsGrid   = document.getElementById("outfitsGrid");
const stylePills    = document.getElementById("stylePills");
const genderPills   = document.getElementById("genderPills");

// ---- Pill helpers ----
function setupPills(container, onSelect) {
  container.querySelectorAll(".style-btn, .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".style-btn, .seg-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      onSelect(btn.dataset.style || btn.dataset.gender);
    });
  });
}

setupPills(stylePills,  (s) => { selectedStyle  = s; savePreferences(); });
setupPills(genderPills, (g) => { selectedGender = g; savePreferences(); });

// ---- Preferences ----
async function savePreferences() {
  try {
    await fetch(`${API_BASE_URL}/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: SESSION_ID, style: selectedStyle, gender: selectedGender }),
    });
  } catch (e) { /* silent fail */ }
}

async function loadPreferences() {
  try {
    const res  = await fetch(`${API_BASE_URL}/preferences/${SESSION_ID}`);
    const data = await res.json();
    if (data.success && data.preferences) {
      selectedStyle  = data.preferences.style  || "casual";
      selectedGender = data.preferences.gender || "unisex";
      activatePill(stylePills,  "style",  selectedStyle);
      activatePill(genderPills, "gender", selectedGender);
    }
  } catch (e) { /* silent fail */ }
}

function activatePill(container, attr, value) {
  container.querySelectorAll("[data-style],[data-gender]").forEach(b => {
    b.classList.toggle("active", (b.dataset[attr] === value));
  });
}

// ---- Main fetch ----
async function fetchWeatherAndOutfits(lat = null, lon = null) {
  const city = cityInput.value.trim();
  if (!city && (!lat || !lon)) { showError("Please enter a city name or use GPS."); return; }

  setLoading(true);
  hideError();

  try {
    let url = `${API_BASE_URL}/weather?sessionId=${SESSION_ID}`;
    if (city) url += `&city=${encodeURIComponent(city)}`;
    else       url += `&lat=${lat}&lon=${lon}`;

    const res  = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.success) { showError(data.error || "Something went wrong."); return; }

    renderWeather(data);
    renderOutfits(data);

  } catch (err) {
    showError("Cannot reach server. Make sure the backend is running on port 5000.");
  } finally {
    setLoading(false);
  }
}

// ---- Render weather ----
function renderWeather(data) {
  const { weather, city, country, outfits } = data;

  // Update the big left-panel temperature
  document.getElementById("liveTempNumber").textContent = weather.temp;
  document.getElementById("liveTempCity").textContent   = city.toLowerCase();

  // Weather strip
  document.getElementById("wsCondition").textContent  = weather.description;
  document.getElementById("wsLocation").textContent   = `${city}, ${country}`;
  document.getElementById("wsSeasonPill").textContent = outfits.season;
  document.getElementById("wsFeels").textContent      = `${weather.feelsLike}°C`;
  document.getElementById("wsHumidity").textContent   = `${weather.humidity}%`;
  document.getElementById("wsWind").textContent       = `${weather.windSpeed} m/s`;

  const icon = document.getElementById("wsIcon");
  icon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  icon.alt = weather.description;

  // Humidity tip
  const tipBar = document.getElementById("tipBar");
  if (outfits.humidityTip) {
    tipBar.textContent  = outfits.humidityTip;
    tipBar.style.display = "block";
  } else {
    tipBar.style.display = "none";
  }

  // Show results, hide empty
  emptyState.style.display  = "none";
  resultsWrap.style.display = "block";
}

// ---- Render outfits ----
function renderOutfits(data) {
  const { outfits, userStyle } = data;

  document.getElementById("ohSub").textContent =
    `${capitalize(userStyle)} · ${capitalize(outfits.tempCategory)} · ${outfits.season}`;

  outfitsGrid.innerHTML = "";

  // Color accents for cards — earthy palette
  const accentColors = ["#b85c38", "#6b7c45", "#a07850", "#7c6b8a", "#4a8070"];

  outfits.outfits.forEach((outfit, i) => {
    const card = document.createElement("div");
    card.className = "outfit-card";
    card.style.setProperty("--card-accent", accentColors[i % accentColors.length]);
    card.style.animationDelay = `${i * 0.08}s`;

    const itemsHTML = outfit.items.map(item => `<li>${item}</li>`).join("");

    card.innerHTML = `
      <span class="card-emoji">${outfit.icon}</span>
      <div class="card-name">${outfit.name}</div>
      <ul class="card-items">${itemsHTML}</ul>
      <div class="card-tip">${outfit.tip}</div>
    `;

    outfitsGrid.appendChild(card);
  });
}

// ---- GPS location ----
function useCurrentLocation() {
  if (!navigator.geolocation) { showError("Geolocation not supported by your browser."); return; }

  locationBtn.style.opacity = "0.5";
  locationBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locationBtn.style.opacity = "1";
      locationBtn.disabled = false;
      cityInput.value = "";
      fetchWeatherAndOutfits(pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      locationBtn.style.opacity = "1";
      locationBtn.disabled = false;
      showError("Location access denied. Enter city manually.");
    }
  );
}

// ---- UI helpers ----
function showError(msg) {
  errorText.textContent   = msg;
  errorBanner.style.display = "block";
}

function hideError() {
  errorBanner.style.display = "none";
}

function setLoading(on) {
  getOutfitsBtn.disabled = on;
  getOutfitsBtn.querySelector(".cta-text").style.display  = on ? "none"   : "inline";
  getOutfitsBtn.querySelector(".cta-loader").style.display = on ? "inline" : "none";
  getOutfitsBtn.querySelector(".cta-arrow").style.display  = on ? "none"   : "block";
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

// ---- Event listeners ----
getOutfitsBtn.addEventListener("click", () => fetchWeatherAndOutfits());
locationBtn.addEventListener("click", useCurrentLocation);
cityInput.addEventListener("keydown", (e) => { if (e.key === "Enter") fetchWeatherAndOutfits(); });

// ---- Init ----
async function init() {
  await loadPreferences();
  cityInput.focus();
}
init();