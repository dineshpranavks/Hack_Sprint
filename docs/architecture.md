# System Architecture Document

## Overview
The AI Interview Preparation Platform is designed as a modular, decoupled MERN architecture with an AI processing pipeline and automated data scraping jobs.

## System Layers

### 1. Client Layer (React + Vite + Tailwind)
- **Routing**: Client-side routing managed by React Router v6.
- **State & Services**: Service layer using Axios instances configured with interceptors for auth tokens.
- **Layouts & UI Component System**: Reusable atomic UI components (`components/ui`), page-specific layouts (`layouts/`), and feature components.

### 2. Backend Layer (Express.js ES Modules)
- **Routing & Controllers**: Layered architecture decoupling HTTP routing (`routes/`) from logic handling (`controllers/`).
- **Services & Repositories**: Pure business logic (`services/`) decoupled from database access methods (`repositories/`).
- **AI Engine (`src/ai`)**: Prompt templates, response parsing logic (`parser.js`), and content generator (`generator.js`) wrapping Google Gemini API.
- **Scraper System (`src/scraper`)**: Standalone scrapers for platforms like LeetCode, GeeksforGeeks, HackerRank, and InterviewBit, managed by a cron/scheduler (`scheduler.js`).

### 3. Data & Auth Layer
- **Firebase Authentication**: Client side handles token acquisition; server middleware verifies JWT ID tokens.
- **Cloud Firestore**: Scalable NoSQL document data store for user profiles, interview questions, company sets, and AI evaluation metrics.

---
*TODO: Add detailed architecture sequence diagrams.*
