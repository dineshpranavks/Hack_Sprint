# REST API Specifications

## Base URL
`http://localhost:5000/api/v1`

## Health Check
- `GET /health`: Returns server status and uptime.

## Planned Endpoints Overview

### Authentication & User Profile (`/auth`, `/users`)
- `POST /api/v1/auth/login`: Verify Firebase ID token and sync user profile.
- `GET /api/v1/users/profile`: Fetch current user's preparation profile.

### Questions & Company Sets (`/questions`, `/companies`)
- `GET /api/v1/questions`: Fetch interview preparation questions with filtering options.
- `GET /api/v1/companies`: Fetch company-specific interview question sets.

### AI Generation & Mock Evaluation (`/ai`)
- `POST /api/v1/ai/generate-question`: Trigger Gemini API to generate contextual interview questions.
- `POST /api/v1/ai/evaluate-answer`: Process and score user interview responses using Gemini API.

---
*TODO: Add OpenAPI / Swagger endpoint documentation definitions.*
