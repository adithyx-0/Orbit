# PROSIT — Backend (scaffold pending)

Node.js + Express + PostgreSQL API for PROSIT.

Planned structure:

```
backend/
├── src/
│   ├── routes/         auth, subscriptions, usage, analytics, goals
│   ├── controllers/
│   ├── services/       analytics engine (DFD Level 2)
│   ├── models/         pg schemas / queries
│   └── middleware/     auth (JWT), error handling
├── migrations/         SQL schema migrations
├── .env.example
└── package.json
```

Sprint 2 work — see `../sprint1.txt` / `../files/` for design docs.
