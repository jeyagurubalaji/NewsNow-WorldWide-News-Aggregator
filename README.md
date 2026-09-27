# 📰 NewsNow — Real-Time Worldwide News Aggregator

**NewsNow** is a full-stack news aggregation platform that collects real-time news from multiple global editions and categories. It provides country-based discovery, multi-language support, secure authentication, personalized bookmarks, and automated RSS news updates.

## ✨ Key Features

* 🌍 **Worldwide News Aggregation** — Automated RSS-based news fetching
* 🗺️ **Country & Category Filtering** — Browse news by region and topic
* 🌐 **Multi-Language Support** — Integrated translation functionality
* 🔐 **Secure Authentication** — JWT + Google OAuth2 + Email OTP
* 🔖 **Personalized Bookmarks** — Save and manage favorite articles
* 🌙 **Responsive UI** — Tailwind CSS with Dark/Light mode
* ⚙️ **Background Scheduler** — Automatic news refresh and synchronization
* 🐳 **Dockerized Backend** — Containerized production deployment

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Axios

**Backend:** Node.js, Express.js, MongoDB, Mongoose

**Authentication:** JWT, Google OAuth2, bcryptjs

**Services:** Nodemailer, RSS Feeds, Google Translate

**Deployment:** Vercel, Render, Docker

## 🏗️ Architecture

```text
                    NewsNow
                       │
             ┌─────────┴─────────┐
             │                   │
      React Frontend       Express Backend
      Vite + Tailwind      Node.js + MongoDB
             │                   │
             │            ┌──────┴──────┐
             │            │             │
             │        RSS Scheduler   Auth
             │            │             │
             │            ▼       JWT + OAuth2
             │       News Sources      + OTP
             │
             └──────── REST API ────────┘
```

## 📁 Project Structure

```text
NewsNow/
├── frontend/       # React + Vite application
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── api/
│
├── backend/        # Express.js REST API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── scheduler/
│
└── README.md
```

## 🚀 Local Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `.env` files with the required MongoDB, JWT, Google OAuth, SMTP, and API configuration.

## 🌐 Deployment

```text
Frontend → Vercel
Backend  → Render + Docker
Database → MongoDB Atlas
```

## 🎯 Project Highlights

* Full-stack **React + Node.js** architecture
* RESTful API development
* MongoDB data modeling with Mongoose
* JWT and OAuth2 authentication
* Automated background RSS processing
* Docker-based backend deployment
* Responsive and multilingual user interface

Built as a full-stack project demonstrating **modern web development, API integration, authentication, database management, automation, and cloud deployment**.
