# PROSIT — Windows Desktop Agent

Python agent that tracks which application is in the foreground, accumulates time per app, and pushes aggregated usage to the PROSIT backend every hour.

---

## How it works

1. Every **5 seconds**, reads the active foreground window using `win32gui` + `psutil`
2. Accumulates seconds per process name in memory
3. Every **60 minutes** (configurable), groups apps by category and POSTs to `POST /api/usage`
4. Automatically re-authenticates if the JWT token expires

---

## Prerequisites

- Windows 10 / 11
- Python 3.10+
- A running PROSIT backend (local or deployed)
- A registered PROSIT account

---

## Setup

```bash
cd windows-agent

# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure
copy .env.example .env
# Edit .env — set API_URL, USER_EMAIL, USER_PASSWORD

# 3. (Optional) Customize app categories
copy categories.json.example categories.json
# Edit categories.json — override which exe maps to which category
```

---

## Run

```bash
python agent.py
```

You'll see log output like:
```
10:00:00 [INFO] PROSIT agent started — polling every 5s, uploading every 60 min
11:00:01 [INFO] Uploading 7 app(s), 52 total minutes — 2026-05-08
11:00:02 [INFO] Upload complete: 7 record(s) saved
```

---

## Configuration (`.env`)

| Variable | Default | Description |
|---|---|---|
| `API_URL` | `http://localhost:5000/api` | Backend base URL |
| `USER_EMAIL` | *(required)* | Your PROSIT account email |
| `USER_PASSWORD` | *(required)* | Your PROSIT account password |
| `UPLOAD_INTERVAL_MINUTES` | `60` | How often to flush data to the server |
| `POLL_INTERVAL_SECONDS` | `5` | How often to sample the active window |

---

## Customizing categories (`categories.json`)

By default, ~60 common apps are pre-categorized. To override or add more:

```json
{
  "chrome.exe": "learning",
  "my_app.exe": "entertainment"
}
```

Valid categories: `learning` · `entertainment` · `productivity`

Unknown apps default to `productivity`.

---

## Run on startup (optional)

To start the agent automatically when Windows boots:

1. Press `Win + R` → type `shell:startup` → OK
2. Create a shortcut to `pythonw.exe` (runs without a console window)
3. Set the target to: `pythonw.exe "C:\path\to\windows-agent\agent.py"`
4. Set "Start in" to `C:\path\to\windows-agent`

Or use Windows Task Scheduler for more control (run on login, restart on failure).

---

## Files

| File | Purpose |
|---|---|
| `agent.py` | Entry point — main polling loop |
| `tracker.py` | Foreground window polling + time accumulation |
| `categorizer.py` | Process name → category mapping |
| `uploader.py` | JWT auth + HTTP upload to backend |
| `categories.json` | Your custom category overrides (gitignored) |
| `.env` | Your credentials (gitignored) |
