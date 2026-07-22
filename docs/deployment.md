# Deployment Guide

## Overview
Recommended deployment strategy for the AI Interview Preparation Platform.

## Frontend (Client)
- **Host Platforms**: Vercel / Netlify / Firebase Hosting
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_API_BASE_URL`

## Backend (Server)
- **Host Platforms**: Render / Railway / AWS App Runner / Google Cloud Run
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`
  - `NODE_ENV=production`
  - `FIREBASE_SERVICE_ACCOUNT_KEY`
  - `GEMINI_API_KEY`
  - `CORS_ORIGIN`

---
*TODO: Add CI/CD GitHub Actions workflow specs.*
