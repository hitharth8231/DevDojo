# 🏗️ Your Complete Project Architecture

## Overview Diagram

```
YOUR COMPUTER
├─────────────────────────────────────────────────────────────┐
│                                                               │
│  Port 3000                    Port 8000                      │
│  ┌──────────────────┐        ┌────────────────────┐          │
│  │  FRONTEND        │        │  BACKEND           │          │
│  │  (React/npm)     │───────▶│  (FastAPI/Python)  │          │
│  │  localhost:3000  │        │  localhost:8000    │          │
│  └──────────────────┘        │                    │          │
│         │                    │  ┌──────────────┐  │          │
│         │                    │  │ Database     │  │          │
│         │                    │  │ Connection   │  │          │
│         │                    │  └──────┬───────┘  │          │
│         │                    └────────┬────────────┘          │
│         │                             │                      │
│         │                             │ localhost:5432       │
│         │                             │                      │
│         │    ╔═══════════════════════╗│                      │
│         │    ║   DOCKER CONTAINER    ║│                      │
│         │    ║                       ║│                      │
│         │    ║  ┌─────────────────┐  ║│                      │
│         │    ║  │   PostgreSQL    │  ║│                      │
│         │    ║  │   (Database)    │  ║│                      │
│         └────╫──│   Port: 5432    │  ║│                      │
│              ║  │   DB: dojo_db   │  ║│                      │
│              ║  └─────────────────┘  ║│                      │
│              ║                       ║│                      │
│              ║  Data Stored Here ────▶│                      │
│              ║  (Persistent Volume)  ║│                      │
│              ║                       ║│                      │
│              ╚═══════════════════════╝│                      │
│                                        │                      │
└────────────────────────────────────────┴──────────────────────┘
```

---

## How Everything Connects

### 1️⃣ User Uses Frontend
```
User → Browser (localhost:3000) → React App
                                    │
                                    └─ Calls API at localhost:8000
```

### 2️⃣ Frontend Calls Backend
```
Frontend (React)
  │
  └─ fetch("http://localhost:8000/auth/login")
     │
     └─ Backend (FastAPI) receives request
```

### 3️⃣ Backend Uses Database
```
Backend (FastAPI)
  │
  └─ Needs data → Creates connection string:
     "postgresql://dojo_user:dojo_pass@localhost:5432/dojo_db"
     │
     └─ Connects to Docker Container
        │
        └─ PostgreSQL Database (running inside Docker)
           │
           └─ Returns data
```

---

## File Structure & What Each Does

```
final_dojo/
│
├── frontend/                    # React app (runs on localhost:3000)
│   ├── src/
│   │   ├── pages/               # Login, Register, Dashboard, etc.
│   │   ├── services/
│   │   │   └── api.js           # Calls backend API
│   │   └── components/          # Navbar, Button, etc.
│   └── package.json             # npm dependencies
│
├── backend/                     # Python backend (runs on localhost:8000)
│   ├── docker-compose.yml       # ⭐ STARTS POSTGRESQL CONTAINER
│   │                            # (this is Docker configuration)
│   ├── core/
│   │   ├── config.py            # Database URL configuration
│   │   ├── database.py          # SQLAlchemy connection
│   │   └── security.py          # Authentication tokens
│   ├── models/                  # Database table definitions
│   │   ├── user.py
│   │   ├── challenge.py
│   │   ├── submission.py
│   │   ├── group.py
│   │   └── leaderboard.py
│   ├── services/                # Business logic
│   │   ├── auth_service.py
│   │   ├── challenge_service.py
│   │   └── submission_service.py
│   ├── api/routes/              # API endpoints
│   │   ├── auth_routes.py
│   │   ├── challenges_routes.py
│   │   └── submission_routes.py
│   ├── init_db.py               # Creates database tables
│   ├── main.py                  # Starts FastAPI server
│   └── requirements.txt          # Python dependencies
│
└── Database (PostgreSQL)        # Runs inside Docker container
    └── Tables: users, groups, challenges, submissions, leaderboard
```

---

## Connection Flow: Step by Step

### Scenario: User Logs In

```
1. User enters email & password in browser
   │
2. Frontend (React) → api.js → /auth/login endpoint
   │
3. Backend (FastAPI) receives login request
   │
4. Backend needs to check if user exists:
   │
5. Backend → SQLAlchemy ORM → PostgreSQL connection string
   │        "postgresql://dojo_user:dojo_pass@localhost:5432/dojo_db"
   │
6. SQLAlchemy → Connects to Docker container on port 5432
   │
7. Docker container → PostgreSQL database
   │
8. PostgreSQL → Searches users table
   │
9. PostgreSQL → Returns user data back to Backend
   │
10. Backend → Validates password
    │
11. Backend → Creates JWT tokens (access_token + refresh_token)
    │
12. Backend → Sends tokens back to Frontend
    │
13. Frontend → Saves tokens in localStorage
    │
14. Frontend → Redirects user to dashboard ✅
```

---

## What You Need to Do Every Time

### For Development

**Every morning when you start coding:**
```powershell
# Terminal 1: Start Database
cd backend
docker-compose up -d

# (1 second - container starts)

# Terminal 2: Start Backend
cd backend
python main.py

# (wait for "Application startup complete")

# Terminal 3: Start Frontend
cd frontend
npm start

# (wait for "Compiled successfully!")
```

**Every evening when you stop coding:**
```powershell
# Terminal 1 (Backend): Ctrl+C
# Terminal 2 (Frontend): Ctrl+C
# Terminal 3 (Database):
docker-compose down
```

### For Production (Deployed Version)

You'll use a **managed database service** instead of Docker:
- AWS RDS
- Heroku PostgreSQL
- Google Cloud SQL
- DigitalOcean Managed Databases

But for development, Docker is perfect!

---

## Docker: Your Single Responsibility

You only need to remember **2 commands**:

```powershell
# START (every morning)
docker-compose up -d

# STOP (every evening)
docker-compose down
```

That's it! Everything else happens automatically. 🐳

---

## How Docker Relates to Your Database Fix

We discussed earlier that you had:
- ❌ 2 duplicate dojo.db files (SQLite)
- ❌ Elasticsearch (unused)
- ✅ PostgreSQL (in Docker) - this is what you should use

### Why Docker + PostgreSQL is Better than SQLite
```
SQLITE (file-based)           |  DOCKER + POSTGRESQL
├─ Good for dev              |  ├─ Good for dev & prod
├─ Limited features          |  ├─ Full database features
├─ Single file (easy to lose)|  ├─ Managed by Docker
├─ Can't handle many users   |  ├─ Scales to many users
└─ Storing JSON in strings   |  └─ Proper JSONB type
```

### Your Setup
```
Before (BROKEN):              Now (FIXED):
├─ SQLite at root             ├─ PostgreSQL in Docker
├─ SQLite in backend          ├─ Single source of truth
├─ Elasticsearch (unused)     └─ Clean, focused
└─ Confusion

Your backend code:            Your backend code:
DATABASE_URL points to        DATABASE_URL points to
which file? 😕                Docker container ✅
```

---

## 🎯 Remember These 3 Things

### 1. Docker = PostgreSQL Container
- Not complicated
- Not magic
- Just PostgreSQL in an isolated box

### 2. You Start It Manually
- No auto-start
- Run `docker-compose up -d` every morning
- Run `docker-compose down` every evening

### 3. It's Optional For Development
- Can use SQLite instead if you don't start Docker
- Backend automatically falls back to SQLite
- But PostgreSQL is better practice

---

## 🚀 You're Ready!

Follow the checklist in [DOCKER_SETUP_CHECKLIST.md](DOCKER_SETUP_CHECKLIST.md) and you'll have:
- ✅ Database running in Docker
- ✅ Backend connected to database
- ✅ Frontend talking to backend
- ✅ No manual database installation
- ✅ Easy to start/stop

**That's all you need to know about Docker!** 🐳✨

