# PROSIT — Sprint 2 Plan

**Goal:** Working web app — real auth, real database, real data on every page.

---

## Tech Stack (Final — no more debate)

| Layer       | Choice                        |
|-------------|-------------------------------|
| Frontend    | React + Vite + Tailwind       |
| Backend     | Node.js + Express             |
| Database    | PostgreSQL via Supabase (free)|
| Auth        | JWT (7-day tokens)            |
| Android     | Kotlin (Android Studio)       |
| Deploy      | Vercel (frontend), Render (backend) |

---

## Git Workflow

```
main                  ← always demo-ready
├── feat/backend      ← Balu works here
├── feat/frontend-api ← Adithya works here
└── feat/android      ← Adithyan R works here
```

1. Each person creates their branch from `main`
2. Work on your branch, commit often
3. Raise a Pull Request into `main` when your piece is working
4. Adithya merges last (frontend depends on backend)

---

## Work Division

### Adithyan R — DB Setup + Android App

**You unblock everyone else. Do this first on Day 1.**

#### Step 1 — Set up the database (Day 1, ~30 minutes)
1. Go to [supabase.com](https://supabase.com) → New project → call it `prosit`
2. Go to **SQL Editor** → paste the full contents of `backend/db/schema.sql` → Run
3. Go to **Settings → Database → Connection string (URI)** → copy it
4. Create `backend/.env` (copy from `backend/.env.example`), paste the connection string as `DATABASE_URL`
5. Also set `JWT_SECRET` to any long random string (e.g. output of `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
6. Share `backend/.env` with Balu (over WhatsApp/Discord — do NOT commit it to git)

#### Step 2 — Android App (`android-app/`, Day 2 onwards)
- Open Android Studio → New Project → Empty Activity (Kotlin)
- Save project into the `android-app/` folder
- Minimum working screens:
  - Login screen → calls `POST /api/auth/login`
  - Subscriptions list screen → calls `GET /api/subscriptions`
- Use Retrofit for HTTP calls, store JWT in SharedPreferences
- See `docs/api.md` for exact request/response shapes

---

### Balu M Krishna — Backend

**Branch:** `feat/backend`

The full backend code is already scaffolded in `backend/src/`. Your job is to get it running and test every route.

#### Step 1 — Get it running (Day 1)
```bash
cd backend
npm install
# Copy .env from Adithyan R
npm run dev        # should print: PROSIT API running on http://localhost:5000
```

Test the health check: `GET http://localhost:5000/health` → should return `{ "status": "ok" }`

#### Step 2 — Test auth routes (Day 1-2)
Use Postman, Thunder Client, or curl:
- `POST /api/auth/register` with `{ "name": "Test", "email": "test@test.com", "password": "pass123" }`
- `POST /api/auth/login` with same email/password → copy the token

See `docs/api.md` for all request/response formats.

#### Step 3 — Test all CRUD routes (Day 2-3)
- Add `Authorization: Bearer <token>` header to all requests
- Test each route in `subscriptions.js`, `goals.js`, `usage.js`, `analytics.js`
- Fix any bugs you find

#### Step 4 — Tell Adithya it's ready
Once register + login + GET /subscriptions work, tell Adithya so he can wire the frontend.

#### Files you own:
- `backend/src/routes/` — all route files
- `backend/src/middleware/`
- `backend/db/schema.sql`

---

### Adithya Rajesh — Frontend Integration

**Branch:** `feat/frontend-api`

The UI already exists. Your job is to replace all mock data with real API calls.

#### Step 1 — Set up (Day 1, can start immediately)
```bash
cd frontend
cp .env.example .env.local   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

The `api.js` axios instance is already created at `src/lib/api.js`. Import it with:
```js
import api from '../lib/api.js'
```

#### Step 2 — Rewrite AuthContext (Day 1-2, no backend needed yet)
Replace mock `login` and `signup` functions in `src/context/AuthContext.jsx`:
```js
// Replace mock login with:
const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password })
  localStorage.setItem('prosit.auth', JSON.stringify(data))
  setUser(data.user)
  return data
}
// Same pattern for signup → POST /auth/register
```

#### Step 3 — Rewrite DataContext (Day 2-3, needs backend running)
Replace localStorage reads/writes with real API calls:
```js
// Example for subscriptions:
useEffect(() => {
  api.get('/subscriptions').then(r => setSubscriptions(r.data.subscriptions))
}, [])

const addSubscription = async (s) => {
  const { data } = await api.post('/subscriptions', s)
  setSubscriptions(prev => [data.subscription, ...prev])
}
```
Do the same for goals and usage (see `docs/api.md` for field names).

#### Step 4 — Update Dashboard to use analytics endpoint (Day 3)
Replace the `useMemo` stats computation in `Dashboard.jsx` with:
```js
const [summary, setSummary] = useState(null)
useEffect(() => {
  api.get('/analytics/summary').then(r => setSummary(r.data))
}, [])
```
Then render `summary.monthlySpend`, `summary.costPerHour`, etc.

#### Step 5 — Add loading + error states to all pages (Day 3-4)
Each page should show a spinner while data loads and an error message if the API call fails.

#### Files you own:
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/DataContext.jsx`
- `frontend/src/pages/` — all pages
- `frontend/src/lib/api.js`

---

## Dependency Order

```
Day 1
  Adithyan R  → Set up Supabase DB, share .env with Balu
  Balu        → npm install, get server running, test health check
  Adithya     → Rewrite AuthContext (can do this without backend)

Day 2
  Balu        → Auth routes working → tell Adithya
  Adithya     → Test real login/signup, start DataContext rewrite
  Adithyan R  → Start Android app

Day 3-4
  Balu        → All CRUD routes tested and working → tell Adithya
  Adithya     → Wire all pages, replace all mock data
  Adithyan R  → Android login + subscriptions list

Day 5
  All         → Run together end-to-end, fix anything broken
  Adithyan R  → Deploy: frontend to Vercel, backend to Render
```

---

## Definition of Done (Sprint 2)

- [ ] User can register and log in (real JWT auth)
- [ ] User can add, edit, delete subscriptions (stored in PostgreSQL)
- [ ] Dashboard shows real spend, charts, AI recommendations
- [ ] Analytics page shows real cost-per-hour and category breakdown
- [ ] Goals page works with real data
- [ ] Android app can log in and list subscriptions
- [ ] App is deployed (not just localhost)
