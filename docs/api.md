# PROSIT API Contract

Base URL: `http://localhost:5000/api` (dev) | `https://your-render-url.onrender.com/api` (prod)

All routes except `/auth/*` require the header:
```
Authorization: Bearer <token>
```

---

## Auth

### POST /auth/register
**Body:**
```json
{ "name": "Adithya", "email": "a@example.com", "password": "secret123" }
```
**Response 201:**
```json
{ "user": { "id": 1, "name": "Adithya", "email": "a@example.com" }, "token": "eyJ..." }
```
**Errors:** `400` missing fields · `409` email already registered

---

### POST /auth/login
**Body:**
```json
{ "email": "a@example.com", "password": "secret123" }
```
**Response 200:**
```json
{ "user": { "id": 1, "name": "Adithya", "email": "a@example.com" }, "token": "eyJ..." }
```
**Errors:** `400` missing fields · `401` invalid credentials

---

## Subscriptions

### GET /subscriptions
**Response 200:**
```json
{
  "subscriptions": [
    {
      "id": 1, "user_id": 1, "name": "Netflix", "category": "Entertainment",
      "cost": "649.00", "billing_cycle": "monthly", "status": "active",
      "hours_this_month": "12.00", "renews_on": "2026-05-03", "created_at": "..."
    }
  ]
}
```

### POST /subscriptions
**Body:**
```json
{
  "name": "Netflix", "category": "Entertainment", "cost": 649,
  "billing_cycle": "monthly", "status": "active",
  "hours_this_month": 12, "renews_on": "2026-05-03"
}
```
**Response 201:** `{ "subscription": { ...fields } }`
**Errors:** `400` missing name/category/cost

### PUT /subscriptions/:id
**Body:** same fields as POST (all required)
**Response 200:** `{ "subscription": { ...fields } }`
**Errors:** `404` not found or not yours

### DELETE /subscriptions/:id
**Response 200:** `{ "message": "Deleted" }`

---

## Goals

### GET /goals
**Response 200:**
```json
{
  "goals": [
    {
      "id": 1, "user_id": 1, "title": "Finish ML course", "category": "Learning",
      "target_hours_per_week": "6.00", "deadline": "2026-06-30",
      "progress": "35.00", "created_at": "..."
    }
  ]
}
```

### POST /goals
**Body:**
```json
{ "title": "Finish ML course", "category": "Learning", "target_hours_per_week": 6, "deadline": "2026-06-30" }
```
**Response 201:** `{ "goal": { ...fields } }`

### PUT /goals/:id
**Body:** `{ "title", "category", "target_hours_per_week", "deadline", "progress" }`
**Response 200:** `{ "goal": { ...fields } }`

### DELETE /goals/:id
**Response 200:** `{ "message": "Deleted" }`

---

## Usage

### GET /usage?days=14
**Response 200:**
```json
{
  "usage": [
    { "date": "2026-04-17", "learning": 45, "entertainment": 120, "productivity": 30 },
    { "date": "2026-04-18", "learning": 60, "entertainment": 90, "productivity": 45 }
  ]
}
```

### POST /usage
Used by Android app and Windows agent to log app usage.
**Body:**
```json
{ "date": "2026-04-30", "category": "entertainment", "minutes": 45, "app_name": "YouTube", "source": "android" }
```
**Response 201:** `{ "log": { ...fields } }`
**Errors:** `400` missing date/category/minutes

---

## Analytics

### GET /analytics/summary
**Response 200:**
```json
{
  "monthlySpend": 7627,
  "costPerHour": 84.5,
  "unusedCount": 1,
  "activeCount": 5,
  "byCategory": {
    "Entertainment": 768,
    "Learning": 4133,
    "Productivity": 2726
  },
  "recommendations": [
    {
      "id": "rec_5",
      "severity": "high",
      "title": "Cancel Adobe Creative Cloud?",
      "body": "You haven't used Adobe Creative Cloud this month but it costs ₹1676.",
      "action": "Review"
    }
  ]
}
```

---

## Error Format (all routes)

```json
{ "error": "Human-readable message here" }
```

HTTP status codes: `400` bad input · `401` not authenticated · `404` not found · `409` conflict · `500` server error
