# How to Run the Floorplan Builder on Windows

## TL;DR - Just Make It Work!

```cmd
cd C:\florify_webapp\replit_floorplan
npm run dev
```

Then open: **http://localhost:5174**

---

## If You're Seeing the Port Error

You saw this error:
```
Error: listen EADDRINUSE: address already in use ::1:5001
```

**This has been fixed!** The app now uses port 5174 by default and will show helpful error messages if there's still a conflict.

---

## Fresh Start Instructions

### Step 1: Open PowerShell or Command Prompt

Press `Win + R`, type `powershell`, press Enter

### Step 2: Navigate to the Project

```cmd
cd C:\florify_webapp\replit_floorplan
```

⚠️ **IMPORTANT**: Make sure you're in the ROOT directory, not the `client` folder!

### Step 3: Install Dependencies (First Time Only)

```cmd
npm install
```

Wait for it to finish (1-3 minutes)

### Step 4: Start the Server

```cmd
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/

serving on port 5174
```

### Step 5: Open Your Browser

Go to: **http://localhost:5174**

You should see the Floorplan Wizard! 🎉

---

## Alternative: Use the Batch File

Double-click `start-dev.bat` in the project folder. It will:
- Check if `.env` file exists (create it if needed)
- Start the dev server
- Show you the URL to open

---

## Alternative: Use the PowerShell Script

```powershell
cd C:\florify_webapp\replit_floorplan
.\start-dev.ps1
```

This script:
- Checks prerequisites
- Creates `.env` if needed
- Shows helpful messages
- Starts the server

---

## What Got Fixed

I've made the following changes to fix the port conflict:

### 1. ✅ Created `.env` file
- Sets PORT to 5174 (not 5001)
- This file is in the root of the project

### 2. ✅ Improved error messages
- If port is in use, you'll see clear instructions
- Shows how to fix the issue

### 3. ✅ Updated all documentation
- Fixed inconsistent port numbers
- Added Windows-specific guides

### 4. ✅ Created helper scripts
- `start-dev.bat` - Easy Windows startup
- `start-dev.ps1` - PowerShell version with checks

---

## Still Having Issues?

### Issue: Port 5174 is already in use

**Solution 1**: Change the port in `.env`
```cmd
echo PORT=5175 > .env
echo NODE_ENV=development >> .env
npm run dev
```

**Solution 2**: Kill the process using port 5174
```cmd
netstat -ano | findstr :5174
taskkill /PID <PID_FROM_ABOVE> /F
```

### Issue: "npm: command not found"

**Solution**: Install Node.js from https://nodejs.org/
- Download the LTS version
- Run the installer
- Restart your terminal

### Issue: "Cannot find module"

**Solution**: 
```cmd
npm install
```

### Issue: Wrong directory

If you're in `C:\florify_webapp\replit_floorplan\client`, do this:
```cmd
cd ..
npm run dev
```

### Issue: Changes not showing in browser

**Solution**: Hard refresh
- Press `Ctrl + Shift + R`
- Or clear browser cache

---

## Configuration Files Created

I've created these files to fix the issue:

1. **`.env`** - Sets PORT=5174
2. **`start-dev.bat`** - Windows batch file to start server
3. **`start-dev.ps1`** - PowerShell script with checks
4. **`WINDOWS_PORT_FIX.md`** - Detailed port troubleshooting
5. **`WINDOWS_QUICKSTART.md`** - Quick Windows guide
6. **`FIX_SUMMARY.md`** - Summary of all changes

All documentation has been updated to use the correct port (5174).

---

## Port Reference

| Service | Port | Notes |
|---------|------|-------|
| **Floorplan Builder** | **5174** | Default (configurable) |
| AI Backend | 5001 | Keep separate! |
| Florify Frontend | 5173 | Keep separate! |

**Each service needs its own unique port!**

---

## Success Checklist

- [ ] Node.js installed (check with `node --version`)
- [ ] In correct directory (`C:\florify_webapp\replit_floorplan`)
- [ ] Dependencies installed (`npm install` completed)
- [ ] `.env` file exists (auto-created by scripts)
- [ ] Server running (`npm run dev`)
- [ ] No port conflicts
- [ ] Browser shows app at http://localhost:5174

If all checked, you're good! 🎉

---

## Quick Reference

```cmd
# Navigate to project
cd C:\florify_webapp\replit_floorplan

# First time setup
npm install

# Start development server
npm run dev

# Stop server
Ctrl + C

# Check for TypeScript errors
npm run check

# Build for production
npm run build

# Run production build
npm start
```

---

## Getting Help

If you're still stuck, check these files:

- **[FIX_SUMMARY.md](./FIX_SUMMARY.md)** - What was changed
- **[WINDOWS_QUICKSTART.md](./WINDOWS_QUICKSTART.md)** - Windows quick start
- **[WINDOWS_PORT_FIX.md](./WINDOWS_PORT_FIX.md)** - Port troubleshooting
- **[README.md](./README.md)** - Full documentation

---

## What Changed in the Code

### server/index.ts
- Added better error handling for port conflicts
- Shows helpful messages when EADDRINUSE error occurs

### .replit
- Updated port from 5000 to 5174
- Consistent with code default

### Documentation
- Fixed all port references (5000 → 5174)
- Added Windows-specific guides
- Created troubleshooting docs

### Scripts
- Created `start-dev.bat` with .env auto-creation
- Created `start-dev.ps1` with prerequisite checks
- Updated existing scripts to show correct ports

---

## Summary

**What was wrong**: Port 5001 was in use (likely by AI backend)

**What I fixed**: 
- Created `.env` with PORT=5174
- Added better error messages
- Updated all documentation
- Created helper scripts

**What you need to do**:
```cmd
cd C:\florify_webapp\replit_floorplan
npm run dev
```

Then open: **http://localhost:5174**

That's it! 🚀

---

**Need more help?** Check the other documentation files or look at the error messages shown by the server - they now include helpful instructions!
