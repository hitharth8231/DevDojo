# 🐳 Docker Explained for Your Project

## What is Docker?

Think of Docker like **shipping containers for software**:
- **Traditional way:** Install PostgreSQL on your computer (takes time, messy)
- **Docker way:** Run PostgreSQL in a container (isolated, clean, easy to remove)

**Benefits:**
- ✅ Don't pollute your computer with installations
- ✅ Same environment on your computer as production
- ✅ Easy to start/stop/delete without affecting other things
- ✅ Others can run your project without manual setup

---

## Your Docker Setup

### What You Have
```
backend/
└── docker-compose.yml
    └── Defines: PostgreSQL service (database)
```

### What It Does
When you run `docker-compose up`, it:
1. Downloads PostgreSQL 15 image (if not already downloaded)
2. Starts a PostgreSQL container on your computer
3. Creates a database called `dojo_db`
4. Exposes it on `localhost:5432`
5. Stores data in a volume (persists even after stopping)

---

## 📋 Configuration Breakdown

```yaml
version: '3.8'                    # Docker Compose version

services:
  postgres:                       # Service name (you'll reference this)
    image: postgres:15           # PostgreSQL version 15
    container_name: postgres     # Name of the running container
    environment:
      POSTGRES_DB: dojo_db       # Database name
      POSTGRES_USER: dojo_user   # Database username
      POSTGRES_PASSWORD: dojo_pass # Database password
    ports:
      - "5432:5432"              # Maps container:host
                                 # (inside Docker:on your computer)
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persistent storage

volumes:
  postgres_data:                 # Named volume for data persistence
```

### How Your Backend Connects
```python
# backend/core/config.py

# PostgreSQL connection string:
DATABASE_URL = "postgresql://dojo_user:dojo_pass@localhost:5432/dojo_db"
                            │username │password │host     │port │database
                            
# Breaking it down:
# - dojo_user = username from docker-compose.yml
# - dojo_pass = password from docker-compose.yml  
# - localhost = your computer
# - 5432 = port exposed by docker-compose.yml
# - dojo_db = database name from docker-compose.yml
```

---

## 🚀 How to Use Docker (Step by Step)

### Prerequisites
**Check if Docker is installed:**
```powershell
docker --version
docker-compose --version
```

If not installed:
- Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Install it
- Restart your computer

---

### Step 1: Start PostgreSQL (Docker Container)

**Navigate to backend folder:**
```powershell
cd c:\Users\Hp\OneDrive\Desktop\final_dojo\backend
```

**Start the database:**
```powershell
docker-compose up -d
```

**What happens:**
- `-d` = "detached" (runs in background)
- Downloads PostgreSQL 15 (first time only)
- Starts container named `postgres`
- PostgreSQL runs on `localhost:5432`
- Returns to prompt immediately

**Output should be:**
```
Creating postgres ... done
```

---

### Step 2: Verify Container is Running

**Check if container is running:**
```powershell
docker-compose ps
```

**Expected output:**
```
NAME      COMMAND                  SERVICE   STATUS
postgres  "docker-entrypoint.s…"   postgres  Up 2 minutes
```

---

### Step 3: Run Your Backend

Now that PostgreSQL is running, your backend can connect to it:

```powershell
# Still in backend folder
python -m pip install -r requirements.txt  # Install dependencies
python main.py                              # Start backend server
```

Your backend will now:
1. Connect to PostgreSQL (localhost:5432)
2. Create tables automatically (init_db.py runs at startup)
3. Serve API on `http://localhost:8000`

---

### Step 4: Stop Docker (When Done)

**Stop the container:**
```powershell
docker-compose down
```

**What happens:**
- Stops the PostgreSQL container
- Keeps the data (volume persists)
- Frees up port 5432

---

## 📊 Visual Flow

```
Your Computer
├─ Your Backend Code (Python/FastAPI)
│  │
│  └─ Connects to localhost:5432
│     │
│     └─ Docker Container (PostgreSQL)
│        └─ Isolated PostgreSQL database
│           └─ Stores data in docker volume
│
└─ Your Frontend (React)
   │
   └─ Calls API on localhost:8000
      │
      └─ Your Backend (responds)
```

---

## ❓ Common Questions

### Q1: Do I Need to Open Docker Desktop GUI?
**Short answer: NO**

When you run `docker-compose up`, it:
- Automatically connects to Docker daemon (background service)
- Starts the container
- Works without opening Docker Desktop

**Optional:** You CAN open Docker Desktop to see running containers visually

### Q2: Do Containers Start Automatically?
**No**, you must run `docker-compose up` every time you restart your computer.

**To make it auto-start:**
- Open Docker Desktop → Settings → General → Check "Start Docker Desktop when you log in"
- Then containers won't auto-start, but Docker daemon will be ready

### Q3: Does Docker Slow Down My Computer?
**Minimal impact:**
- Uses ~300MB RAM when running PostgreSQL
- Uses ~1GB disk space for PostgreSQL image
- Much lighter than actual PostgreSQL installation

### Q4: Can I See What's in the Database?
**Yes! Use DBeaver (free GUI):**
1. Download [DBeaver Community](https://dbeaver.io/)
2. Create connection:
   - Host: `localhost`
   - Port: `5432`
   - Database: `dojo_db`
   - User: `dojo_user`
   - Password: `dojo_pass`
3. Browse tables, run queries, see data

---

## 🔄 Typical Workflow

### Daily Development
```powershell
# Morning (start work)
cd backend
docker-compose up -d          # Start PostgreSQL (1 second)
python main.py                # Start backend

# ... work on code ...

# Evening (end work)
# Close backend with Ctrl+C
docker-compose down           # Stop PostgreSQL
```

### Useful Commands

```powershell
# Start container
docker-compose up -d

# Stop container
docker-compose down

# View logs
docker-compose logs -f postgres

# Check status
docker-compose ps

# Remove container & data
docker-compose down -v        # -v also removes volume

# Enter container shell
docker-compose exec postgres bash
```

---

## 🐛 Troubleshooting

### Problem: "Port 5432 is already in use"
**Cause:** Another PostgreSQL is running (or old container didn't stop)

**Solution:**
```powershell
# Find what's using port 5432
netstat -ano | findstr :5432

# Stop Docker container
docker-compose down

# Or stop the process by ID
taskkill /PID <PID> /F
```

### Problem: "Cannot connect to Docker daemon"
**Cause:** Docker Desktop isn't running

**Solution:**
1. Open Docker Desktop application
2. Wait for it to start (~10 seconds)
3. Try again

### Problem: "Container exits immediately"
**Cause:** Something went wrong during startup

**Solution:**
```powershell
# View logs to see error
docker-compose logs postgres

# Look for red error messages
```

---

## 🎯 Your Current Setup Status

### ✅ What's Configured
- PostgreSQL 15 via docker-compose.yml
- Database: `dojo_db`
- User: `dojo_user`
- Port: `5432`

### ⚠️ Important Notes
1. **Elasticsearch removed:** The `.env` still mentions `ES_HOST` but we deleted all ES code, so it's not used
2. **SQLite fallback:** If you don't start Docker, your backend will use SQLite instead of PostgreSQL
3. **Production difference:** In production, you'd use a managed PostgreSQL service, not Docker

---

## 📝 Quick Reference

### To Start Everything
```powershell
cd c:\Users\Hp\OneDrive\Desktop\final_dojo\backend

# Start database
docker-compose up -d

# Wait 5 seconds for database to be ready

# Start backend
python main.py

# In another terminal, start frontend
cd ..\frontend
npm start
```

### To Stop Everything
```powershell
# Stop backend: Ctrl+C in the backend terminal
# Stop database:
docker-compose down

# Stop frontend: Ctrl+C in the frontend terminal
```

### Check Everything Works
- Backend: http://localhost:8000 (should show welcome message)
- Frontend: http://localhost:3000 (should show login page)
- Database: `docker-compose ps` (should show postgres running)

---

## 🔐 Security Notes

### IMPORTANT: Change These in Production!
Your `.env` has default credentials:
```
POSTGRES_USER=dojo_user
POSTGRES_PASSWORD=dojo_pass
```

**For production:**
1. Generate strong random passwords
2. Use environment-specific .env files
3. Never commit `.env` with real credentials to GitHub
4. Use managed database services (AWS RDS, Heroku, etc.)

---

## 📚 Next Steps

1. **Install Docker Desktop** (if not already installed)
2. **Start PostgreSQL:**
   ```powershell
   cd backend
   docker-compose up -d
   ```
3. **Run your backend:**
   ```powershell
   python main.py
   ```
4. **Verify connection:**
   - Check `docker-compose ps` (shows running containers)
   - Check backend logs (should say "Application startup complete")
   - Try http://localhost:8000 in browser

5. **Optional: Install DBeaver** to visually browse your database

---

## ✨ You Now Know:
- ✅ What Docker is (containers for software)
- ✅ What your docker-compose.yml does (runs PostgreSQL)
- ✅ How to start/stop containers
- ✅ How your backend connects to database
- ✅ Common issues and solutions

**You don't need to be a Docker expert to use it - just run `docker-compose up` and forget about it!** 🐳

