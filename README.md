# AI Interview Preparation Platform (HackSprint)

A production-ready, scalable MERN stack platform boilerplate for AI-driven technical interview preparation.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18+ (Vite)
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth SDK
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (ES Modules - `"type": "module"`)
- **Web Framework**: Express.js
- **Database / Storage**: Firebase Firestore DB
- **Admin SDK**: Firebase Admin SDK
- **AI Engine**: Google Gemini API (`@google/genai` / `@google/generative-ai`)
- **Architecture**: Modular Layered REST API (Controllers, Services, Repositories, AI Pipeline, Web Scrapers)

---

## 📁 Directory Structure

```text
Hack_Sprint
│
├── client
│   ├── public
│   ├── src
│   │   ├── assets
│   │   │   ├── icons
│   │   │   ├── images
│   │   │   └── fonts
│   │   ├── components
│   │   │   ├── common
│   │   │   ├── ui
│   │   │   ├── navbar
│   │   │   ├── sidebar
│   │   │   └── cards
│   │   ├── pages
│   │   │   ├── Login
│   │   │   ├── Dashboard
│   │   │   ├── Companies
│   │   │   ├── Questions
│   │   │   ├── Profile
│   │   │   └── NotFound
│   │   ├── layouts
│   │   │   ├── MainLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── hooks
│   │   ├── context
│   │   ├── routes
│   │   ├── services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── questionService.js
│   │   ├── utils
│   │   ├── constants
│   │   ├── styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── jsconfig.json
│
├── server
│   ├── src
│   │   ├── config
│   │   │   ├── db.js
│   │   │   ├── firebase.js
│   │   │   ├── gemini.js
│   │   │   └── env.js
│   │   ├── middleware
│   │   ├── models
│   │   ├── controllers
│   │   ├── routes
│   │   ├── services
│   │   ├── repositories
│   │   ├── validators
│   │   ├── utils
│   │   ├── jobs
│   │   ├── ai
│   │   │   ├── prompts
│   │   │   ├── parser.js
│   │   │   └── generator.js
│   │   ├── scraper
│   │   │   ├── leetcode.js
│   │   │   ├── gfg.js
│   │   │   ├── hackerrank.js
│   │   │   ├── interviewbit.js
│   │   │   └── scheduler.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── jsconfig.json
│
├── docs
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── deployment.md
│
├── .gitignore
├── README.md
└── package.json
```

---

## 🛠️ Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step 1: Install Dependencies
Run the install command from the root directory to set up both frontend and backend dependencies:
```bash
npm run install:all
```
*Or manually:*
```bash
cd client && npm install
cd ../server && npm install
```

### Step 2: Environment Variables
Copy `.env.example` to `.env` in both `client` and `server` directories and fill in your credential placeholders:

```bash
# Client env
cp client/.env.example client/.env

# Server env
cp server/.env.example server/.env
```

### Step 3: Run Development Servers
Start both client and server concurrently from the root directory:
```bash
npm run dev
```

- **Frontend (Vite)**: `http://localhost:5173`
- **Backend API (Express)**: `http://localhost:5000`

---

## 📌 Architecture Notes & Path Aliases

Both client and server support `@` path aliasing configured via `jsconfig.json`.

- `client/src/...` -> `@/...`
- `server/src/...` -> `@/...`

Example import in Client:
```javascript
import Navbar from '@/components/navbar/Navbar';
```

Example import in Server:
```javascript
import env from '@/config/env.js';
```
