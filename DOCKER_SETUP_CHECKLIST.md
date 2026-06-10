# 🚀 Docker Setup Checklist for Your Project

## Step 1: Check if Docker is Installed

**Run this command in PowerShell:**
```powershell
docker --version
docker-compose --version
```

**Expected output:**
```
Docker version 24.0.x, build xxxxx
Docker Compose version v2.x.x, build xxxxx
```

---

## ✅ If Docker is Already Installed - Skip to Step 3

## ❌ If Docker is NOT Installed - Follow Step 2

### Step 2: Install Docker Desktop

1. **Download Docker Desktop:**
   - Go to https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Choose your Windows version (Home or Pro)

2. **Install:**
   - Run the installer
   - Follow default options
   - Restart your computer when prompted

3. **Verify Installation:**
   ```powershell
   docker --version
   docker-compose --version
   ```

---

## Step 3: Start PostgreSQL Container

**Open PowerShell and navigate to backend:**
```powershell
cd c:\Users\Hp\OneDrive\Desktop\final_dojo\backend
```

**Start the database container:**
```powershell
docker-compose up -d
```

**Expected output:**
```
[+] Running 2/2
 ✓ Network backend_default        Created
 ✓ Container postgres              Started
```

**Verify it's running:**
```powershell
docker-compose ps
```

**Expected output:**
```
NAME      COMMAND                  SERVICE   STATUS
postgres  "docker-entrypoint.s…"   postgres  Up 2 seconds
```

---

## Step 4: Verify Database Connection

**Test if database is accessible:**

### Option A: Using Python
```powershell
python
```

Then in Python:
```python
import psycopg2
conn = psycopg2.connect(
    host="localhost",
    database="dojo_db",
    user="dojo_user",
    password="dojo_pass",
    port=5432
)
print("✅ Connected to PostgreSQL!")
conn.close()
```

If you get an error: `ImportError: No module named 'psycopg2'`, run:
```powershell
pip install psycopg2-binary
```

### Option B: Using DBeaver (Visual)
1. Download DBeaver: https://dbeaver.io/
2. Install it
3. Create New Database Connection:
   - Database: PostgreSQL
   - Server Host: localhost
   - Port: 5432
   - Database: dojo_db
   - Username: dojo_user
   - Password: dojo_pass
4. Click "Test Connection"
5. Should show: "Connected"

---

## Step 5: Initialize Database Tables

**While PostgreSQL is running, initialize tables:**

Still in `backend` folder:
```powershell
python init_db.py
```

**Expected output:**
```
Database tables created successfully!
```

---

## Step 6: Start Your Backend Server

**In the backend folder:**
```powershell
python main.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**Test the API:**
- Open browser: http://localhost:8000
- Should show: `{"message": "Welcome to the DOJO backend!"}`

---

## Step 7: Start Frontend (In Another Terminal)

**Open a NEW PowerShell window:**
```powershell
cd c:\Users\Hp\OneDrive\Desktop\final_dojo\frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view frontend in the browser.
  http://localhost:3000
```

---

## 🎯 You're All Set!

Now you have:
- ✅ PostgreSQL running in Docker (`localhost:5432`)
- ✅ Backend running (`http://localhost:8000`)
- ✅ Frontend running (`http://localhost:3000`)

---

## 📝 Daily Workflow

### Morning (Start Development)
```powershell
# Terminal 1: Start Database
cd backend
docker-compose up -d

# Terminal 2: Start Backend
cd backend
python main.py

# Terminal 3: Start Frontend
cd frontend
npm start
```

### Evening (End Development)
```powershell
# Terminal 1 (Backend): Press Ctrl+C
# Terminal 2 (Frontend): Press Ctrl+C
# Terminal 3 (Database): 
docker-compose down
```

---

## 🆘 Troubleshooting

### Problem: "Port 5432 is already in use"
```powershell
# Stop existing container
docker-compose down

# Or kill the process using the port
netstat -ano | findstr :5432
taskkill /PID <PID> /F
```

### Problem: "Cannot connect to Docker daemon"
- Open Docker Desktop application
- Wait 10 seconds
- Try again

### Problem: Backend can't connect to database
```powershell
# Check if container is running
docker-compose ps

# If not running, start it
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Problem: Tables not created
```powershell
# Make sure you're in backend folder
cd backend

# Run initialization
python init_db.py
```

---

## 🔄 Useful Docker Commands

```powershell
# View running containers
docker-compose ps

# View container logs
docker-compose logs postgres

# View real-time logs
docker-compose logs -f postgres

# Stop container (keeps data)
docker-compose down

# Stop AND remove all data
docker-compose down -v

# Restart container
docker-compose restart

# Enter container shell
docker-compose exec postgres bash

# Check container resource usage
docker stats postgres
```

---

## ✨ Summary

| What | How | Status |
|------|-----|--------|
| Install Docker | Download from docker.com | ✅ Manual one-time |
| Start Database | `docker-compose up -d` | 🔄 Every dev session |
| Initialize DB | `python init_db.py` | ✅ One-time |
| Start Backend | `python main.py` | 🔄 Every dev session |
| Start Frontend | `npm start` | 🔄 Every dev session |
| Stop Everything | `docker-compose down` + Ctrl+C | 🔄 End of day |

---

## ❓ FAQ

**Q: Do I need to open Docker Desktop?**  
A: No, but you can if you want to see containers visually.

**Q: Will Docker slow my computer?**  
A: Minimal impact (~300MB RAM for PostgreSQL).

**Q: Can I use SQLite instead?**  
A: Yes! If you don't start Docker, backend uses `backend/dojo.db` automatically.

**Q: What if I restart my computer?**  
A: Data is saved (Docker volume), just run `docker-compose up -d` again.

**Q: Can I delete the database?**  
A: Yes, run `docker-compose down -v` (removes container + data).

---

## 🎓 Next: Learn More

Once comfortable with these steps, explore:
- Docker volumes (persistent storage)
- Multiple services (Docker Compose with more services)
- Docker networks (how containers communicate)
- Environment variables (configuration management)

But for now, just focus on:
1. `docker-compose up -d` (start)
2. `docker-compose down` (stop)
3. That's it! 🚀

