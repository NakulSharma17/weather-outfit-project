# 🌤️ WeatherWear — Real-Time Weather-Based Outfit Suggestion Platform

<div align="center">

![Wardrobe Banner](https://img.shields.io/badge/Wardrobe-Weather%20Outfit%20Suggester-7c3aed?style=for-the-badge&logo=cloudflare&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://weather-outfit-project.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://weather-outfit-project.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://cloud.mongodb.com)

**Stop guessing. Dress for the weather.**

*A full-stack web application that suggests outfits based on real-time weather conditions and user style preferences.*

</div>

---

## 📸 Preview

```
🌤️ Enter your city → Pick your style → Get outfit suggestions instantly
```

> Midnight Glass UI · Purple + Cyan theme · Glassmorphism cards · Live weather data

---

## 👥 Team

| Name | Role | Contribution |
|------|------|-------------|
| **Nakul Sharma** | Full Stack Lead | Server setup, API endpoints, Frontend UI, Deployment |
| **Yashwant** | Backend Developer | Outfit logic, Weather processing, Database schema |
| **Tanay** | Frontend Developer | UI animations, Glassmorphism design, CSS theme |

---

## 🚀 Live Links

| Service | URL |
|---------|-----|
| 🌐 Frontend | https://weather-outfit-project.vercel.app |
| ⚙️ Backend API | https://weather-outfit-project.onrender.com/api |
| 🏥 Health Check | https://weather-outfit-project.onrender.com/api/health |

---

## ✨ Features

### Core Features
- 🌡️ **Real-time weather data** — fetched live from OpenWeather API
- 👗 **4 Style categories** — Casual, Formal, Sporty, Streetwear
- 🌦️ **5 Weather conditions** — Freezing, Cold, Mild, Hot, Rainy
- 📍 **GPS location support** — auto-detect via browser geolocation
- 🧠 **Preference memory** — style saved to MongoDB per session
- 🌍 **Any city worldwide** — powered by OpenWeather's global database

### UI Features
- 🌑 **Midnight Glass theme** — deep black with purple + cyan accents
- 💎 **Glassmorphism cards** — frosted glass with backdrop-filter blur
- 🎨 **Dynamic backgrounds** — gradient shifts based on weather condition
- ✨ **Card animations** — slide-up with staggered delays
- 🌀 **Animated weather icons** — spinning sun, drifting clouds, bouncing rain
- 🌡️ **C/F toggle** — smooth Celsius to Fahrenheit conversion
- ⏳ **Skeleton loader** — shimmer effect while data loads
- 📱 **Fully responsive** — works on mobile and desktop

### Pages
- 🏠 Landing page with hero, features and how-it-works sections
- 🎯 Main app with split layout
- 👥 About page with team info and tech stack
- 📬 Contact page with Formspree integration
- 🌧️ Custom 404 page

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| HTML5 | Structure and markup |
| CSS3 | Styling, animations, glassmorphism |
| Vanilla JavaScript | DOM manipulation, API calls |
| Cormorant Garamond | Display typography |
| Outfit Font | UI typography |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework and routing |
| Axios | HTTP client for OpenWeather API |
| CORS | Cross-origin resource sharing |
| dotenv | Environment variable management |

### Database
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Cloud database |
| Mongoose | ODM schema and validation |

### APIs & Services
| Service | Purpose |
|---------|---------|
| OpenWeather API | Real-time weather data |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Formspree | Contact form submissions |

---

## 📁 Project Structure

```
weather-outfit-project/
│
├── Backend/
│   ├── controllers/
│   │   └── outfitController.js    # Outfit suggestion logic
│   ├── models/
│   │   └── UserPreference.js      # MongoDB schema
│   ├── routes/
│   │   └── api.js                 # REST API endpoints
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   └── .env.example               # Sample environment variables
│
└── Frontend/
    ├── css/
    │   ├── style.css              # Main app styles (Midnight Glass)
    │   └── pages.css              # Landing/About/Contact styles
    ├── js/
    │   ├── app.js                 # Main app logic
    │   └── pages.js               # Pages logic + contact form
    ├── app.html                   # Main outfit suggester app
    ├── index.html                 # Landing page
    ├── about.html                 # About page
    ├── contact.html               # Contact page
    └── 404.html                   # 404 error page
```

---

## ⚙️ Local Setup Guide

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| MongoDB | v6+ | https://www.mongodb.com |
| Git | Latest | https://git-scm.com |

### Step 1 — Clone the Repository

```bash
git clone https://github.com/NakulSharma17/weather-outfit-project.git
cd weather-outfit-project
```

### Step 2 — Get OpenWeather API Key

1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Copy your API key from the dashboard
4. Note: New keys take up to 2 hours to activate

### Step 3 — Set Up Environment Variables

```bash
cd Backend
cp .env.example .env
```

Edit `.env` with your values:

```env
OPENWEATHER_API_KEY=your_api_key_here
MONGODB_URI=mongodb://localhost:27017/weather_outfit_db
PORT=5000
```

### Step 4 — Install Dependencies

```bash
cd Backend
npm install
```

### Step 5 — Start the Server

```bash
node server.js
```

You should see:
```
✅ Connected to MongoDB successfully
🌤️  Weather Outfit Server running on http://localhost:5000
📡  API available at http://localhost:5000/api
🔑  OpenWeather API Key: ✅ Set
```

### Step 6 — Open the App

Open `Frontend/app.html` with VS Code Live Server

OR navigate to `http://localhost:5000/app.html`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/weather?city=London&sessionId=xxx` | Get weather + outfit suggestions |
| GET | `/api/weather?lat=51.5&lon=-0.1&sessionId=xxx` | Get weather by coordinates |
| POST | `/api/preferences` | Save user style preferences |
| GET | `/api/preferences/:sessionId` | Get saved preferences |

### Sample Response — `/api/weather`

```json
{
  "success": true,
  "city": "Mumbai",
  "country": "IN",
  "weather": {
    "temp": 32,
    "feelsLike": 36,
    "humidity": 78,
    "description": "scattered clouds",
    "icon": "03d",
    "windSpeed": 4.2,
    "condition": "Clouds"
  },
  "outfits": {
    "season": "Summer",
    "tempCategory": "hot",
    "outfits": [
      {
        "name": "Summer Breezy",
        "items": ["Linen shirt", "Shorts", "Sandals", "Cap", "Sunglasses"],
        "icon": "☀️",
        "tip": "Linen stays cool and gets better-looking wrinkled!"
      }
    ],
    "humidityTip": "⚠️ High humidity today — choose breathable, moisture-wicking fabrics."
  },
  "userStyle": "casual"
}
```

---

## 🗄️ Database Schema

```javascript
UserPreference {
  sessionId:  String   // unique browser session ID
  style:      String   // casual | formal | sporty | streetwear
  gender:     String   // male | female | unisex
  lastCity:   String   // last searched city
  visitCount: Number   // total searches made
  createdAt:  Date     // auto-generated
  updatedAt:  Date     // auto-generated
}
```

---

## 🚀 Deployment Architecture

```
User Browser
     │
     ▼
┌─────────────┐
│   Vercel    │  ← Frontend (HTML/CSS/JS)
│  (Always On)│
└─────────────┘
     │ API calls
     ▼
┌─────────────┐
│   Render    │  ← Backend (Node.js + Express)
│ (Free tier) │    Sleeps after 15 min inactivity
└─────────────┘
     │ Mongoose
     ▼
┌─────────────┐
│ MongoDB     │  ← Database (MongoDB Atlas)
│  Atlas      │    Always on · Cloud hosted
│ (Always On) │
└─────────────┘
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|---------|
| City not found | Check spelling. Use full city name e.g. "New Delhi" |
| API key error | New keys take 2 hours to activate on OpenWeather |
| MongoDB not connecting | Make sure `mongod` is running locally |
| Blank page on localhost | Open via Live Server, not by double-clicking HTML |
| Render takes 30 seconds | Free tier cold start — normal behaviour |
| CORS error | Check API_BASE_URL in app.js matches your Render URL |

---

## 👨‍💻 Git Workflow Used

```bash
# Each feature developed on separate branch
git checkout -b feature-name

# Regular commits
git add .
git commit -m "descriptive message"
git push origin feature-name

# Pull request → review → merge to main
# Vercel auto-deploys on merge to main
```

---

## 📜 License

This project was built as a college academic project.
Free to use for educational purposes.

---

## 🙏 Acknowledgements

- [OpenWeather API](https://openweathermap.org) — Weather data
- [MongoDB Atlas](https://cloud.mongodb.com) — Cloud database
- [Vercel](https://vercel.com) — Frontend hosting
- [Render](https://render.com) — Backend hosting
- [Formspree](https://formspree.io) — Contact form
- [Google Fonts](https://fonts.google.com) — Cormorant Garamond + Outfit

---

<div align="center">

Built with ☕ by **Nakul Sharma & Team** · 2026

*"Stop guessing. Dress for the weather."*

</div>