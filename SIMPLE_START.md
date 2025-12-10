# 🌿 FLORIFY PROJECT - SIMPLE START GUIDE

## ⚡ Quick Start (Just Run This!)

**Option 1: Start Everything at Once (Easiest)**
```cmd
cd C:\florify_webapp
start-all.bat
```

**Option 2: Start Each Application Separately**

1. **AI Backend** (do this first):
   ```cmd
   cd C:\florify_webapp\backend\ai_processing
   start-ai-backend.bat
   ```
   Wait for: "Starting AI Processing Server on port 5001"

2. **Florify Frontend**:
   ```cmd
   cd C:\florify_webapp\florify-frontend
   start-frontend.bat
   ```
   Wait for: "Local: http://localhost:5173"

3. **Floorplan Builder** (optional):
   ```cmd
   cd C:\florify_webapp\replit_floorplan
   start-dev.bat
   ```
   Wait for: "serving on port 5174"

Then open your browser to:
- **Main App**: http://localhost:5173
- **Floorplan Tool**: http://localhost:5174

---

## 📋 First Time Setup

### 1. Install Required Software

**Node.js** (for Frontend & Floorplan Builder):
- Download: https://nodejs.org/
- Install the LTS version
- Restart terminal after installing

**Python** (for AI Backend):
- Download: https://www.python.org/downloads/
- Install Python 3.10 or 3.11
- ✅ Check "Add Python to PATH"

### 2. Verify Installation
```cmd
node --version
python --version
```

### 3. Run the Startup Script
```cmd
cd C:\florify_webapp
start-all.bat
```

The scripts will automatically:
- Create virtual environments
- Install all dependencies
- Start all servers

---

## 🎯 What Each Part Does

| Application | Port | Purpose |
|-------------|------|---------|
| **Florify Frontend** | 5173 | Main web app for garden planning |
| **AI Backend** | 5001 | Processes blueprints using AI |
| **Floorplan Builder** | 5174 | Tool to create floorplans |

---

## 🔧 If Something Goes Wrong

### Error: "Port already in use"

**Quick Fix**: Kill the process using the port
```cmd
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Error: "npm: command not found"
**Fix**: Install Node.js from https://nodejs.org/

### Error: "python: command not found"
**Fix**: Install Python from https://www.python.org/

### Error: "Cannot find module"
**Fix for Node.js apps**:
```cmd
cd C:\florify_webapp\florify-frontend
npm install
```

**Fix for Python app**:
```cmd
cd C:\florify_webapp\backend\ai_processing
venv\Scripts\activate
pip install flask flask-cors pillow numpy python-dotenv
```

### Error: Script won't run in PowerShell
**Fix**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📂 Directory Structure

```
C:\florify_webapp\
├── florify-frontend/           # Main React app
│   └── start-frontend.bat      # ← Double-click this
│
├── backend/
│   └── ai_processing/          # Python AI backend
│       └── start-ai-backend.bat # ← Or double-click this
│
├── replit_floorplan/           # Floorplan builder
│   └── start-dev.bat           # ← Or double-click this
│
└── start-all.bat               # ← Or just double-click this!
```

---

## ✅ Success Checklist

You'll know it's working when:

- [ ] No error messages in the terminal windows
- [ ] You see "Starting AI Processing Server on port 5001"
- [ ] You see "Local: http://localhost:5173"
- [ ] You see "serving on port 5174"
- [ ] Browser opens and shows the applications

---

## 🎉 That's It!

**To start working**:
1. Double-click `start-all.bat` in `C:\florify_webapp`
2. Wait 20 seconds for everything to start
3. Open browser to http://localhost:5173
4. Start using Florify!

**To stop**:
- Press `Ctrl+C` in each terminal window

---

## 📖 More Information

For detailed documentation, see:
- **Complete Guide**: `COMPLETE_SETUP_GUIDE.md`
- **Floorplan Builder**: `replit_floorplan/README.md`
- **Frontend**: `florify-frontend/README.md`

---

**Need help?** All the startup scripts have built-in error checking and will show you exactly what's wrong if something fails.

Just run the scripts and follow the error messages! 🚀
