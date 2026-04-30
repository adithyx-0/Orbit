# CLAUDE.md — Project Reference

## Project Overview

**Name:** AI-Powered Personal Resource Optimization and Subscription Intelligence System
**Course:** 22AIE311 — Software Engineering
**Phase:** Planning (no source code yet — implementation pending)

A multi-platform web application that tracks subscription expenses, monitors cross-device app usage, and provides AI-powered analytics to optimize users' time and money allocation.

---

## Team

| Name | Roll No | Role |
|------|---------|------|
| Adithya Rajesh | AM.SC.U4AIE23007 | Frontend & Integration Developer |
| Balu M Krishna | AM.SC.U4AIE23026 | Backend & Data Engineer |
| Adithyan R | AM.SC.U4AIE23065 | Project Manager / System Architect |

---

## Technology Stack (Finalization Needed — See Issues)

| Layer | Technology |
|-------|-----------|
| Frontend | React.js / Next.js + Tailwind CSS / Material UI |
| Backend | Node.js + Express.js |
| Auth | JWT-based Authentication |
| Database | PostgreSQL (primary) / MongoDB / Firebase Firestore |
| Android App | Kotlin (Android Studio) |
| Windows Agent | Python (psutil / pywin32) or C# (.NET) |
| Notifications | SendGrid / Firebase Cloud Messaging |
| Deployment | AWS / Google Cloud / Vercel |
| Visualization | Chart.js / Recharts |

---

## Core Features

1. **Subscription Management** — Add, edit, pause, delete; categorize by type (learning, entertainment, productivity)
2. **Device Usage Monitoring** — Android companion app + Windows desktop agent
3. **Analytics Engine** — Cost-per-hour, ROI, utilization efficiency, opportunity cost
4. **Intelligent Recommendations** — Optimal time windows, goal alignment, behavioral analysis
5. **Dashboard** — Real-time visualizations, weekly reports
6. **Goal Tracking** — Personal objectives and schedule alignment

---

## Architecture

```
Web Dashboard (React/Next.js)
        |
Backend API (Node.js / Express.js)
        |
    Database (PostgreSQL)
        |
Device Monitoring Layer
   ├── Android App (Kotlin)
   └── Windows Desktop Agent (Python / C#)
```

---

## Functional Requirements (Summary)

- User registration, login, JWT auth
- CRUD for subscriptions with categorization
- Track and store Android + Windows app usage
- Analytics dashboard with cost-per-hour, ROI metrics
- Periodic reports and usage summaries
- Goal setting and progress tracking
- Notification service (email / push)

## Non-Functional Requirements

- **Security:** Encrypted storage, secure APIs
- **Privacy:** Explicit user consent for device monitoring
- **Performance:** Efficient analytics processing
- **Scalability:** Multi-user support
- **Usability:** Simple, intuitive UI
- **Reliability:** Consistent uptime

---

## Project Constraints

- Academic semester timeline
- Free-tier / open-source technologies only
- Must comply with Android and Windows system APIs
- Data privacy compliance required

---

## Current State

- Only documentation PDFs exist: `files/Abstract_01.pdf`, `files/SE_LAB SHEET 1.pdf`
- No source code, config files, or folder structure created yet
- Implementation has not started

---

## Known Issues & Ambiguities (Needs Team Decision)

1. **Technology Stack Not Finalized:**
   - Frontend: React.js vs Next.js — pick one
   - Database: PostgreSQL vs MongoDB vs Firebase — pick one
   - Windows Agent: Python vs C# — pick one
   - Notifications: SendGrid vs Firebase Cloud Messaging — pick one

2. **Missing Implementation Artifacts:**
   - No `package.json`, `requirements.txt`, or `.env` templates
   - No database schema / ER diagram implemented
   - No API specification (OpenAPI/Swagger)
   - No folder/project structure created
   - No version control (`.git`) initialized

3. **Documentation Gaps:**
   - Use cases listed but no detailed flow (pre/post conditions, alternate flows)
   - No wireframes or UI mockups referenced
   - No milestone/sprint plan defined

---

## Recommended Next Steps

1. Finalize technology stack choices (resolve ambiguities above)
2. Initialize git repository
3. Create folder structure for each component (frontend, backend, android, windows-agent)
4. Set up `package.json` (Node.js), `requirements.txt` (Python), `.env.example`
5. Define database schema and create migration scripts
6. Scaffold authentication module
7. Build and expose core API endpoints
8. Develop frontend dashboard
9. Implement device monitoring agents
10. Set up CI/CD and deployment pipeline
