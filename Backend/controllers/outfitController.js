// controllers/outfitController.js
// Core logic: maps weather conditions to outfit suggestions

/**
 * OUTFIT DATABASE
 * Organized by style (casual, formal, sporty, streetwear)
 * Each outfit has a name, items list, emoji icon, and color tag
 */
const outfitDatabase = {
  casual: {
    // Very cold: below 5°C
    freezing: [
      {
        name: "Arctic Layer Stack",
        items: ["Thermal base layer", "Chunky knit sweater", "Puffer jacket", "Wool trousers", "Snow boots", "Beanie & gloves"],
        icon: "🧥",
        color: "#4a90d9",
        tip: "Layer up! Trap warm air between layers for max warmth.",
      },
      {
        name: "Winter Cozy",
        items: ["Turtleneck", "Fleece hoodie", "Long wool coat", "Thermal leggings", "Ankle boots", "Scarf"],
        icon: "🧣",
        color: "#6c5ce7",
        tip: "A scarf can block wind chill effectively around the neck.",
      },
    ],
    // Cold: 5–14°C
    cold: [
      {
        name: "Autumn Layers",
        items: ["Long-sleeve shirt", "Denim jacket", "Chinos", "Chelsea boots", "Light scarf"],
        icon: "🍂",
        color: "#e17055",
        tip: "Denim jackets add style while blocking light wind.",
      },
      {
        name: "Cozy Casual",
        items: ["Flannel shirt", "Pullover hoodie", "Jeans", "White sneakers", "Cap"],
        icon: "👟",
        color: "#00b894",
        tip: "Hoodies are perfect for mild cold days.",
      },
    ],
    // Mild: 15–24°C
    mild: [
      {
        name: "Everyday Fresh",
        items: ["Plain t-shirt", "Light chinos", "Sneakers", "Watch"],
        icon: "👕",
        color: "#fdcb6e",
        tip: "Light fabrics like cotton breathe well in mild weather.",
      },
      {
        name: "Casual Smart",
        items: ["Polo shirt", "Khaki shorts", "Loafers", "Sunglasses"],
        icon: "🕶️",
        color: "#55efc4",
        tip: "Polo shirts bridge casual and smart effortlessly.",
      },
    ],
    // Hot: 25°C and above
    hot: [
      {
        name: "Summer Breezy",
        items: ["Linen shirt", "Shorts", "Sandals", "Cap", "Sunglasses"],
        icon: "☀️",
        color: "#ff7675",
        tip: "Linen stays cool and gets better-looking wrinkled!",
      },
      {
        name: "Beach Ready",
        items: ["Tank top", "Swim shorts", "Flip-flops", "Sunscreen SPF50+"],
        icon: "🏖️",
        color: "#fd79a8",
        tip: "Always apply sunscreen when it's this hot.",
      },
    ],
    // Rainy
    rainy: [
      {
        name: "Rain Ready",
        items: ["Waterproof jacket", "Jeans", "Rubber boots / Rain boots", "Umbrella"],
        icon: "☂️",
        color: "#74b9ff",
        tip: "Waterproof jackets beat umbrellas on windy days.",
      },
      {
        name: "Puddle Jumper",
        items: ["Hoodie", "Windbreaker", "Waterproof trousers", "Gumboots"],
        icon: "🌧️",
        color: "#a29bfe",
        tip: "Avoid cotton in rain — it stays wet long.",
      },
    ],
  },

  formal: {
    freezing: [
      {
        name: "Executive Winter",
        items: ["Dress shirt", "Tie", "Wool suit", "Overcoat", "Leather dress boots", "Cashmere scarf"],
        icon: "🧥",
        color: "#2d3436",
        tip: "A tailored overcoat keeps you polished and warm.",
      },
    ],
    cold: [
      {
        name: "Business Layered",
        items: ["Dress shirt", "Blazer", "Trousers", "Oxford shoes", "Light overcoat"],
        icon: "👔",
        color: "#636e72",
        tip: "A well-fitted blazer elevates any cold-weather look.",
      },
    ],
    mild: [
      {
        name: "Classic Office",
        items: ["Oxford shirt", "Blazer", "Slacks", "Leather shoes", "Belt"],
        icon: "💼",
        color: "#b2bec3",
        tip: "Neutral colors like navy and grey are timeless.",
      },
    ],
    hot: [
      {
        name: "Tropical Formal",
        items: ["Linen suit", "Light dress shirt (no tie)", "Loafers", "Pocket square"],
        icon: "🌴",
        color: "#dfe6e9",
        tip: "Linen suits are the ultimate hot-weather formal wear.",
      },
    ],
    rainy: [
      {
        name: "Boardroom Rain",
        items: ["Suit with waterproof spray", "Trench coat", "Leather boots", "Compact umbrella"],
        icon: "☂️",
        color: "#2980b9",
        tip: "A trench coat is the most professional rain outerwear.",
      },
    ],
  },

  sporty: {
    freezing: [
      {
        name: "Cold Run Gear",
        items: ["Thermal running tights", "Long-sleeve base layer", "Running jacket", "Thermal gloves", "Headband", "Trail shoes"],
        icon: "🏃",
        color: "#e74c3c",
        tip: "Dress for 10°C warmer — you'll heat up fast!",
      },
    ],
    cold: [
      {
        name: "Active Cold",
        items: ["Compression leggings", "Hoodie", "Track jacket", "Running shoes", "Gloves"],
        icon: "🎽",
        color: "#e67e22",
        tip: "Compression gear improves circulation in the cold.",
      },
    ],
    mild: [
      {
        name: "Gym-to-Street",
        items: ["Joggers", "Athletic t-shirt", "Zip hoodie", "Trainers", "Gym bag"],
        icon: "💪",
        color: "#27ae60",
        tip: "Moisture-wicking fabrics keep you fresh longer.",
      },
    ],
    hot: [
      {
        name: "Summer Sport",
        items: ["Sports shorts", "Sleeveless top", "Running shoes", "Cap", "Sports water bottle"],
        icon: "🏋️",
        color: "#f39c12",
        tip: "Stay hydrated — drink water every 20 minutes.",
      },
    ],
    rainy: [
      {
        name: "Wet Weather Workout",
        items: ["Waterproof running jacket", "Quick-dry shorts", "Trail shoes (waterproof)", "Sweat band"],
        icon: "🌦️",
        color: "#2980b9",
        tip: "Avoid cotton — synthetic fabrics dry 5x faster.",
      },
    ],
  },

  streetwear: {
    freezing: [
      {
        name: "Hypebeast Winter",
        items: ["Graphic hoodie", "Puffer jacket (oversized)", "Cargo pants", "Chunky boots", "Beanie", "Chain necklace"],
        icon: "🔥",
        color: "#d63031",
        tip: "Oversized puffers are both warm and on-trend.",
      },
    ],
    cold: [
      {
        name: "Drip Season",
        items: ["Vintage hoodie", "Flannel shirt (open)", "Baggy jeans", "Jordan 1s", "Bucket hat"],
        icon: "🧢",
        color: "#6c5ce7",
        tip: "Layering different textures creates visual depth.",
      },
    ],
    mild: [
      {
        name: "Chill Fit",
        items: ["Graphic tee", "Cargo shorts", "Chunky sneakers", "Cap", "Crossbody bag"],
        icon: "🎒",
        color: "#00cec9",
        tip: "Monochromatic fits look effortlessly cool.",
      },
    ],
    hot: [
      {
        name: "Heat Wave Fit",
        items: ["Oversized tee (cropped)", "Biker shorts", "Platform sneakers", "Mini bag", "Bucket hat"],
        icon: "😎",
        color: "#fdcb6e",
        tip: "Light-colored outfits reflect sunlight to keep you cool.",
      },
    ],
    rainy: [
      {
        name: "Wet Weather Drip",
        items: ["Techwear jacket", "Cargo pants", "Waterproof boots", "Crossbody bag", "Hood up 😤"],
        icon: "⚡",
        color: "#7f8c8d",
        tip: "Techwear was literally designed for this weather.",
      },
    ],
  },
};

/**
 * Determines the temperature category based on degrees Celsius
 * @param {number} temp - Temperature in Celsius
 * @returns {string} - Category: freezing, cold, mild, or hot
 */
function getTempCategory(temp) {
  if (temp < 5) return "freezing";
  if (temp < 15) return "cold";
  if (temp < 25) return "mild";
  return "hot";
}

/**
 * Determines the season based on month (Northern Hemisphere)
 * @param {number} month - Month number (0 = January)
 * @returns {string} - Season name
 */
function getSeason(month) {
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}

/**
 * Main function: generates outfit suggestions based on weather and user style
 * @param {object} weatherData - Weather data from OpenWeather API
 * @param {string} style - User's preferred style
 * @returns {object} - Outfit suggestions and weather summary
 */
function generateOutfits(weatherData, style = "casual") {
  const temp = weatherData.main.temp; // Temperature in Celsius
  const weatherMain = weatherData.weather[0].main.toLowerCase(); // e.g., "rain", "clear"
  const humidity = weatherData.main.humidity;
  const month = new Date().getMonth();
  const season = getSeason(month);

  // Decide if we should use the "rainy" outfit category
  const isRainy = ["rain", "drizzle", "thunderstorm"].includes(weatherMain);
  const tempCategory = isRainy ? "rainy" : getTempCategory(temp);

  // Get the outfit list for this style and weather
  const styleOutfits = outfitDatabase[style] || outfitDatabase.casual;
  const outfits = styleOutfits[tempCategory] || styleOutfits.mild;

  // Build a human-readable weather description
  const weatherDescription = weatherData.weather[0].description;

  return {
    season,
    tempCategory,
    weatherDescription,
    humidity,
    outfits,
    // Extra tip based on humidity
    humidityTip:
      humidity > 70
        ? "⚠️ High humidity today — choose breathable, moisture-wicking fabrics."
        : humidity < 30
        ? "💧 Low humidity — consider a light moisturizer to prevent dry skin."
        : null,
  };
}

module.exports = { generateOutfits, getTempCategory, getSeason };