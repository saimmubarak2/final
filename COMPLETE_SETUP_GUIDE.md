# ========================================
# FLORIFY PROJECT - COMPLETE SETUP GUIDE
# ========================================

## 🎯 What This Project Includes

Your Florify project has THREE applications:

1. **Florify Frontend** (Port 5173)
   - Main garden planning web app
   - Location: `C:\florify_webapp\florify-frontend`

2. **AI Backend** (Port 5001)
   - Blueprint processing & symbol detection
   - Location: `C:\florify_webapp\backend\ai_processing`

3. **Floorplan Builder** (Port 5174)
   - Standalone floorplan wizard
   - Location: `C:\florify_webapp\replit_floorplan`

---

## 🚀 QUICK START - Get Everything Running

### Option 1: Run All Three (Recommended)

Use the master startup script I've created:

```cmd
cd C:\florify_webapp
start-all.bat
```

This will open 3 windows:
- Window 1: Florify Frontend (http://localhost:5173)
- Window 2: AI Backend (http://localhost:5001)
- Window 3: Floorplan Builder (http://localhost:5174)

### Option 2: Run Individually

**Florify Frontend:**
```cmd
cd C:\florify_webapp\florify-frontend
npm install
npm run dev
```
Open: http://localhost:5173

**AI Backend:**
```cmd
cd C:\florify_webapp\backend\ai_processing
start-ai-backend.bat
```
Running on: http://localhost:5001

**Floorplan Builder:**
```cmd
cd C:\florify_webapp\replit_floorplan
npm run dev
```
Open: http://localhost:5174

---

## 📋 First Time Setup (Do This Once)

### 1. Install Node.js
- Download from: https://nodejs.org/
- Install the LTS version (v20+)
- Restart terminal after installation

### 2. Install Python (for AI Backend)
- Download from: https://www.python.org/downloads/
- Install Python 3.10 or 3.11
- ✅ Check "Add Python to PATH" during installation

### 3. Verify Installations
```cmd
node --version
npm --version
python --version
pip --version
```

### 4. Install Dependencies

**For Florify Frontend:**
```cmd
cd C:\florify_webapp\florify-frontend
npm install
```

**For Floorplan Builder:**
```cmd
cd C:\florify_webapp\replit_floorplan
npm install
```

**For AI Backend:**
```cmd
cd C:\florify_webapp\backend\ai_processing
python -m venv venv
venv\Scripts\activate
pip install -r requirements-minimal.txt
```

---

## 🎨 What Each Application Does

### Florify Frontend (Main App)
- Garden planning interface
- User authentication
- Garden management
- Calls AI Backend for processing

### AI Backend
- Processes blueprint images
- Matches empty to filled blueprints
- Detects garden symbols using AI/ML
- Provides API endpoints for frontend

### Floorplan Builder
- Standalone tool for creating floorplans
- Interactive drawing canvas
- Export to PNG/PDF
- Can be used independently

---

## 🔧 Configuration Files Created

I've created these files to make everything work:

### Backend:
- `backend/ai_processing/start-ai-backend.bat` - Windows startup
- `backend/ai_processing/.env` - Port config (5001)

### Floorplan Builder:
- `replit_floorplan/.env` - Port config (5174)
- `replit_floorplan/start-dev.bat` - Windows startup
- `replit_floorplan/start-dev.ps1` - PowerShell startup

### Root:
- `start-all.bat` - Start everything at once
- `start-all.ps1` - PowerShell version
- `COMPLETE_SETUP_GUIDE.md` - This file

---

## 📊 Port Reference

| Application | Port | URL |
|-------------|------|-----|
| Florify Frontend | 5173 | http://localhost:5173 |
| AI Backend | 5001 | http://localhost:5001 |
| Floorplan Builder | 5174 | http://localhost:5174 |

**Important**: Each needs its own unique port!

---

## 🐛 Troubleshooting

### "Port already in use"

**For any application, change its port:**

**Florify Frontend**: Edit `vite.config.js`, change port
**AI Backend**: Edit `backend/ai_processing/.env`, change PORT
**Floorplan Builder**: Edit `replit_floorplan/.env`, change PORT

Or kill the process:
```cmd
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### "npm: command not found"
Install Node.js from https://nodejs.org/

### "python: command not found"
Install Python from https://www.python.org/

### "Cannot find module" (Node.js)
```cmd
npm install
```

### "ModuleNotFoundError" (Python)
```cmd
cd C:\florify_webapp\backend\ai_processing
venv\Scripts\activate
pip install -r requirements-minimal.txt
```

### Virtual Environment Not Activating
Make sure you're using the correct command:
```cmd
# Windows Command Prompt:
venv\Scripts\activate.bat

# Windows PowerShell:
venv\Scripts\Activate.ps1

# If you get execution policy error in PowerShell:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎯 Simplified Workflow

### Daily Development:

1. **Start everything:**
   ```cmd
   cd C:\florify_webapp
   start-all.bat
   ```

2. **Work on code** in your editor

3. **Test in browser:**
   - Main app: http://localhost:5173
   - Floorplan: http://localhost:5174
   - AI API: http://localhost:5001/health

4. **Stop when done:** Press `Ctrl+C` in each terminal window

---

## 📁 Project Structure

```
C:\florify_webapp\
│
├── florify-frontend/          # Main React app
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/            # Page components
│   │   ├── api/              # API integration
│   │   └── config.js         # API configuration
│   └── package.json
│
├── backend/
│   └── ai_processing/        # Python AI backend
│       ├── app.py            # Flask server
│       ├── requirements.txt  # Python deps
│       └── .env              # Config
│
├── replit_floorplan/         # Floorplan builder
│   ├── client/               # React frontend
│   ├── server/               # Express backend
│   └── .env                  # Config
│
└── start-all.bat             # Master startup script
```

---

## ✅ Success Checklist

Before you consider setup complete:

- [ ] Node.js installed (v20+)
- [ ] Python installed (3.10+)
- [ ] Dependencies installed for all 3 apps
- [ ] Can start Florify Frontend (5173)
- [ ] Can start AI Backend (5001)
- [ ] Can start Floorplan Builder (5174)
- [ ] No port conflicts
- [ ] Can access all apps in browser

---

## 🎓 Next Steps

1. **Read each app's README**:
   - `florify-frontend/README.md`
   - `replit_floorplan/README.md`

2. **Test the AI Backend**:
   ```cmd
   # In browser or curl:
   http://localhost:5001/health
   ```

3. **Explore the code**:
   - Start with `florify-frontend/src/App.jsx`
   - Check `backend/ai_processing/app.py` for API
   - Review `replit_floorplan/client/src/App.tsx`

4. **Make changes**:
   - Edit any file
   - Save
   - See changes in browser (hot reload)

---

## 🚨 Important Notes

1. **AI Backend Dependencies**: 
   - Use `requirements-minimal.txt` for quick start
   - Use `requirements.txt` for full ML features (needs GPU/more RAM)

2. **Virtual Environment**: 
   - Always activate it before running Python commands:
     ```cmd
     cd C:\florify_webapp\backend\ai_processing
     venv\Scripts\activate
     ```

3. **Port Changes**: 
   - If you change ports, update configs in all places
   - Frontend may need to know AI backend port

4. **Development vs Production**:
   - These are development setups
   - For production, you'd need proper hosting

---

## 📞 Quick Command Reference

```cmd
# Start everything at once
cd C:\florify_webapp
start-all.bat

# OR start individually:

# Florify Frontend
cd C:\florify_webapp\florify-frontend
npm run dev

# AI Backend
cd C:\florify_webapp\backend\ai_processing
venv\Scripts\activate
python app.py

# Floorplan Builder
cd C:\florify_webapp\replit_floorplan
npm run dev

# Stop any server: Ctrl+C

# Install dependencies:
npm install                              # Node.js
pip install -r requirements-minimal.txt  # Python
```

---

## 🎉 You're Ready!

Everything is configured and ready to run. Just execute:

```cmd
cd C:\florify_webapp
start-all.bat
```

Then open your browser to:
- **Main App**: http://localhost:5173
- **Floorplan Builder**: http://localhost:5174
- **AI API Health**: http://localhost:5001/health

Happy coding! 🌿

---

**Created**: December 10, 2025
**Last Updated**: December 10, 2025
