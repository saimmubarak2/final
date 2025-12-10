# Port Conflict Fix - Summary

## What Was Fixed

I've resolved the `EADDRINUSE` port conflict issue and made several improvements to make the Replit Floorplan Builder work smoothly on Windows.

## Changes Made

### 1. ✅ Created `.env` file
- **File**: `.env`
- **Content**: 
  ```env
  PORT=5174
  NODE_ENV=development
  ```
- **Purpose**: Sets the default port to 5174 (avoiding conflict with port 5001)

### 2. ✅ Enhanced error handling
- **File**: `server/index.ts`
- **Change**: Added helpful error message when port is in use
- **Benefit**: Now shows clear instructions on how to fix port conflicts

### 3. ✅ Updated documentation
- **Files**: `README.md`, `WINDOWS_PORT_FIX.md`, `WINDOWS_QUICKSTART.md`
- **Changes**: 
  - Fixed port number inconsistencies (changed from 5000 to 5174)
  - Added Windows-specific troubleshooting
  - Clarified correct directory to run from

### 4. ✅ Improved startup scripts
- **Files**: `start-dev.bat`, `start-dev.ps1` (new)
- **Changes**:
  - Auto-creates `.env` file if missing
  - Checks you're in the correct directory
  - Shows correct port in output

### 5. ✅ Updated Replit configuration
- **File**: `.replit`
- **Changes**: Updated all port references from 5000 to 5174 for consistency

## How to Use (Windows)

### Quick Start Option 1: Use the Batch File
```cmd
cd C:\florify_webapp\replit_floorplan
start-dev.bat
```

### Quick Start Option 2: Use PowerShell Script
```powershell
cd C:\florify_webapp\replit_floorplan
.\start-dev.ps1
```

### Quick Start Option 3: Manual
```cmd
cd C:\florify_webapp\replit_floorplan
npm run dev
```

Then open: **http://localhost:5174**

## Key Points

### ✅ Correct Directory
Always run from the **root** directory:
```
C:\florify_webapp\replit_floorplan
```

**NOT** from:
```
C:\florify_webapp\replit_floorplan\client  ❌
```

### ✅ Default Port
The application now uses port **5174** by default (configurable via `.env`)

### ✅ Port Conflicts
If you still get a port conflict:

1. Check what port is being used:
   ```powershell
   netstat -ano | findstr :5174
   ```

2. Change port in `.env`:
   ```env
   PORT=5175
   ```

3. Or kill the conflicting process:
   ```powershell
   taskkill /PID <PID> /F
   ```

## Why Port 5001 Was Being Used

The error you saw indicated port 5001 was in use. This likely means:

1. Another service (possibly the AI backend) is running on port 5001
2. An environment variable was set to use port 5001
3. A previous instance of the dev server is still running

The fix: Use port 5174 instead (now configured in `.env`)

## Troubleshooting

### Issue: Still seeing port error
- **Check**: Do you have a `.env` file in the root directory?
- **Fix**: Run `start-dev.bat` or `start-dev.ps1` to auto-create it

### Issue: "npm: command not found"
- **Check**: Is Node.js installed?
- **Fix**: Install from https://nodejs.org/

### Issue: "Cannot find module"
- **Fix**: Run `npm install` from the root directory

### Issue: Wrong directory
- **Symptom**: No `package.json` found
- **Fix**: Navigate to the root directory (`cd ..`)

## Port Summary

| Application | Port | Configurable |
|------------|------|--------------|
| **Floorplan Builder** | **5174** (default) | ✅ Yes (via .env) |
| AI Backend | 5001 | ✅ Yes |
| Florify Frontend | 5173 | ✅ Yes |

Make sure each application uses a unique port!

## Files You Can Reference

- 📘 **[README.md](./README.md)** - Full documentation
- 🚀 **[WINDOWS_QUICKSTART.md](./WINDOWS_QUICKSTART.md)** - Quick start for Windows
- 🔧 **[WINDOWS_PORT_FIX.md](./WINDOWS_PORT_FIX.md)** - Port troubleshooting
- 📖 **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** - Detailed local setup

## Next Steps

1. ✅ Open PowerShell/Command Prompt
2. ✅ Navigate to project root: `cd C:\florify_webapp\replit_floorplan`
3. ✅ Run: `start-dev.bat` or `npm run dev`
4. ✅ Open browser: http://localhost:5174
5. ✅ Start building floorplans!

## Testing the Fix

To verify everything works:

```cmd
# 1. Navigate to project root
cd C:\florify_webapp\replit_floorplan

# 2. Check that .env exists
type .env

# 3. Install dependencies (if needed)
npm install

# 4. Start dev server
npm run dev

# 5. You should see:
# serving on port 5174

# 6. Open browser to:
# http://localhost:5174
```

## Success!

If you can open http://localhost:5174 and see the Floorplan Wizard, you're all set! 🎉

The application is now configured to:
- ✅ Use a non-conflicting port (5174)
- ✅ Show helpful error messages if there's a port conflict
- ✅ Auto-create configuration files when needed
- ✅ Work smoothly on Windows

---

**Need help?** Check the documentation files listed above or review the error messages shown by the server.
