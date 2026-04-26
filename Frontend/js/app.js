// js/app.js — Wardrobe · Midnight Glass Theme
// Full featured: C/F toggle, weather gradients, animations, skeleton loader

const API_BASE_URL = "https://weather-outfit-project.onrender.com/api";

// ---- Session ----
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
let isCelsius      = true;         // C/F toggle state
let lastWeatherData = null;        // Store last result for unit conversion

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
const skeletonWrap  = document.getElementById("skeletonWrap");

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

// ---- C/F Toggle ----
document.getElementById("cfC").addEventListener("click", () => {
  if (!isCelsius) {
    isCelsius = true;
    document.getElementById("cfC").classList.add("active");
    document.getElementById("cfF").classList.remove("active");
    if (lastWeatherData) updateTempDisplay(lastWeatherData.weather);
  }
});

document.getElementById("cfF").addEventListener("click", () => {
  if (isCelsius) {
    isCelsius = false;
    document.getElementById("cfF").classList.add("active");
    document.getElementById("cfC").classList.remove("active");
    if (lastWeatherData) updateTempDisplay(lastWeatherData.weather);
  }
});

// Converts celsius to fahrenheit
function toF(c) { return Math.round((c * 9/5) + 32); }

// Updates all temperature displays based on current unit
function updateTempDisplay(weather) {
  const temp     = isCelsius ? weather.temp     : toF(weather.temp);
  const feels    = isCelsius ? weather.feelsLike : toF(weather.feelsLike);
  const unit     = isCelsius ? "°C" : "°F";

  // Animate the big temp number
  animateNumber("liveTempNumber", parseInt(document.getElementById("liveTempNumber").textContent) || 0, temp, 600);

  document.getElementById("wsFeels").textContent   = `${feels}${unit}`;
  document.getElementById("liveTempUnit").textContent = unit;
}

// Smooth number count-up animation
function animateNumber(elementId, from, to, duration) {
  const el = document.getElementById(elementId);
  const start = performance.now();
  const diff = to - from;

  function step(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(from + diff * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---- Preferences ----
async function savePreferences() {
  try {
    await fetch(`${API_BASE_URL}/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: SESSION_ID, style: selectedStyle, gender: selectedGender }),
    });
  } catch (e) { /* silent */ }
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
  } catch (e) { /* silent */ }
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
  showSkeleton();
  hideResults();

  try {
    let url = `${API_BASE_URL}/weather?sessionId=${SESSION_ID}`;
    if (city) url += `&city=${encodeURIComponent(city)}`;
    else       url += `&lat=${lat}&lon=${lon}`;

    const res  = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.success) { showError(data.error || "Something went wrong."); hideSkeleton(); return; }

    lastWeatherData = data;
    renderWeather(data);
    renderOutfits(data);
    hideSkeleton();

    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById("resultsWrap").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

  } catch (err) {
    hideSkeleton();
    showError("Cannot reach server. Make sure backend is running.");
  } finally {
    setLoading(false);
  }
}

// ---- Render weather ----
function renderWeather(data) {
  const { weather, city, country, outfits } = data;

  // Animate big temp number on left panel
  const prevTemp = parseInt(document.getElementById("liveTempNumber").textContent) || 0;
  const displayTemp = isCelsius ? weather.temp : toF(weather.temp);
  animateNumber("liveTempNumber", prevTemp, displayTemp, 800);
  document.getElementById("liveTempCity").textContent   = city.toLowerCase();
  document.getElementById("liveTempUnit").textContent   = isCelsius ? "°C" : "°F";

  // Weather strip
  document.getElementById("wsCondition").textContent  = weather.description;
  document.getElementById("wsLocation").textContent   = `${city}, ${country}`;
  document.getElementById("wsSeasonPill").textContent = outfits.season;
  document.getElementById("wsFeels").textContent      = `${isCelsius ? weather.feelsLike : toF(weather.feelsLike)}${isCelsius ? "°C" : "°F"}`;
  document.getElementById("wsHumidity").textContent   = `${weather.humidity}%`;
  document.getElementById("wsWind").textContent       = `${weather.windSpeed} m/s`;

  // Weather icon
  const icon = document.getElementById("wsIcon");
  icon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  icon.alt = weather.description;

  // Apply icon animation
  applyIconAnimation(weather.condition);

  // Apply dynamic background
  applyWeatherBackground(weather.condition, weather.temp);

  // Humidity tip
  const tipBar = document.getElementById("tipBar");
  if (outfits.humidityTip) {
    tipBar.textContent   = outfits.humidityTip;
    tipBar.style.display = "block";
  } else {
    tipBar.style.display = "none";
  }

  emptyState.style.display  = "none";
  resultsWrap.style.display = "block";
}

// ---- Dynamic background ----
function applyWeatherBackground(condition, temp) {
  const panel = document.getElementById("rightPanel");
  panel.classList.remove("bg-clear","bg-cloudy","bg-rainy","bg-hot","bg-night","bg-snow");

  const hour    = new Date().getHours();
  const isNight = hour >= 20 || hour < 6;
  if (isNight) { panel.classList.add("bg-night"); return; }

  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle") || c.includes("thunder")) panel.classList.add("bg-rainy");
  else if (c.includes("snow")) panel.classList.add("bg-snow");
  else if (c.includes("cloud")) panel.classList.add("bg-cloudy");
  else if (temp >= 30) panel.classList.add("bg-hot");
  else panel.classList.add("bg-clear");
}

// ---- Icon animation ----
function applyIconAnimation(condition) {
  const icon = document.getElementById("wsIcon");
  icon.classList.remove("sunny","cloudy","rainy","snowy");

  const c = condition.toLowerCase();
  if (c.includes("clear"))  icon.classList.add("sunny");
  else if (c.includes("cloud")) icon.classList.add("cloudy");
  else if (c.includes("rain") || c.includes("drizzle") || c.includes("thunder")) icon.classList.add("rainy");
  else if (c.includes("snow")) icon.classList.add("snowy");
}

// ---- Render outfits ----
function renderOutfits(data) {
  const { outfits, userStyle } = data;

  document.getElementById("ohSub").textContent =
    `${capitalize(userStyle)} · ${capitalize(outfits.tempCategory)} · ${outfits.season}`;

  outfitsGrid.innerHTML = "";

  outfits.outfits.forEach((outfit, i) => {
    const card = document.createElement("div");
    card.className = "outfit-card";
    card.style.animationDelay = `${i * 0.1}s`;

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

// ---- Skeleton loader ----
function showSkeleton() {
  if (skeletonWrap) skeletonWrap.classList.add("visible");
}

function hideSkeleton() {
  if (skeletonWrap) skeletonWrap.classList.remove("visible");
}

function hideResults() {
  resultsWrap.style.display = "none";
}

// ---- GPS ----
function useCurrentLocation() {
  if (!navigator.geolocation) { showError("Geolocation not supported."); return; }

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
  errorText.textContent     = msg;
  errorBanner.style.display = "block";
}

function hideError() {
  errorBanner.style.display = "none";
}

function setLoading(on) {
  getOutfitsBtn.disabled = on;
  getOutfitsBtn.querySelector(".cta-text").style.display   = on ? "none"   : "inline";
  getOutfitsBtn.querySelector(".cta-loader").style.display = on ? "inline" : "none";
  getOutfitsBtn.querySelector(".cta-arrow").style.display  = on ? "none"   : "block";
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

// ---- Events ----
getOutfitsBtn.addEventListener("click", () => fetchWeatherAndOutfits());
locationBtn.addEventListener("click", useCurrentLocation);
cityInput.addEventListener("keydown", (e) => { if (e.key === "Enter") fetchWeatherAndOutfits(); });

// ---- Init ----
async function init() {
  await loadPreferences();
  cityInput.focus();
}
init();