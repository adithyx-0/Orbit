# Prosit

AI-Powered Personal Resource Optimization & Subscription Intelligence System

> Course: 22AIE311 — Software Engineering

---

## What It Does

Prosit helps you track subscriptions, monitor how much you actually use each one, and tells you whether they're worth keeping — with an AI chatbot that knows your actual usage data, not just generic advice.

**Key features:**
- Subscription management with cost and billing tracking
- Usage logging (manual + device agents)
- ROI score per subscription — cost per hour of actual use
- AI chatbot with your real subscription context
- Gamification — star rewards, streaks, and a level system (Bronze → Platinum)
- Renewal email alerts (3 days before charge)
- Weekly/monthly cost forecasting


## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL (Supabase) |
| Auth | JWT |
| AI | Gemini / Claude API |
| Email | SendGrid |
| Deployment | Render (backend), Vercel (frontend) |

---

## Project Structure

```
Orbit/
├── backend/          Node.js + Express API
│   ├── src/
│   │   ├── routes/   auth, subscriptions, goals, usage, analytics, gamification, chat
│   │   ├── middleware/
│   │   └── db/
│   └── db/
│       └── schema.sql
├── frontend/         React + Vite app
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── lib/
├── android-app/      Kotlin companion app
└── windows-agent/    Usage monitoring agent
```

---

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev               # runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env      # set VITE_API_URL=http://localhost:5000
npm install
npm run dev               # runs on http://localhost:5173
```

### Database

Run `backend/db/schema.sql` in your Supabase SQL editor to create all tables.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/subscriptions` | List user's subscriptions |
| POST | `/api/subscriptions` | Add subscription |
| PUT | `/api/subscriptions/:id` | Update subscription |
| DELETE | `/api/subscriptions/:id` | Delete subscription |
| GET | `/api/goals` | List goals |
| POST | `/api/goals` | Create goal |
| GET | `/api/usage` | Get usage logs |
| POST | `/api/usage` | Log usage |
| GET | `/api/analytics/summary` | Cost & usage analytics |
| POST | `/api/chat` | AI chatbot (coming Week 2) |
| GET | `/api/gamification/score` | User score & level |
| POST | `/api/gamification/stars/award` | Award star on goal completion |
| GET | `/api/gamification/streak` | Current streak data |

---

## Environment Variables

See `backend/.env.example` for required variables:

- `DATABASE_URL` — Supabase PostgreSQL connection string
- `JWT_SECRET` — Random string, min 32 chars
- `PORT` — Default 5000

---

## Live Demo

- Backend API: https://prosit-ej7i.onrender.com/health
- Frontend: *(https://prosit-ej7i.onrender.com  )*
