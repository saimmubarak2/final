# Windows Port Conflict Fix

## Problem
You're seeing an error like:
```
Error: listen EADDRINUSE: address already in use ::1:5001
```

This means port 5001 (or whatever port is shown) is already being used by another process.

## Quick Fix

### Option 1: Use a Different Port (Recommended)
1. Make sure you have a `.env` file in `/workspace/replit_floorplan/`
2. Set the PORT to something not in use:
   ```
   PORT=5174
   NODE_ENV=development
   ```
3. Run from the **root directory** (not the client folder):
   ```powershell
   cd C:\florify_webapp\replit_floorplan
   npm run dev
   ```

### Option 2: Kill the Process Using the Port
1. Find what's using the port:
   ```powershell
   netstat -ano | findstr :5001
   ```
2. Look for the PID (last column)
3. Kill it:
   ```powershell
   taskkill /PID <PID_NUMBER> /F
   ```

## Important: Run from Correct Directory

❌ **WRONG**: `cd replit_floorplan\client` then `npm run dev`

✅ **CORRECT**: `cd replit_floorplan` then `npm run dev`

The `package.json` is in the **root** of the replit_floorplan folder, not in the client subfolder.

## Common Causes
- AI backend running on port 5001
- Another instance of the dev server
- Florify frontend using nearby ports
- System service using the port

## Default Ports
- Floorplan Builder: 5174 (default)
- AI Backend: 5001
- Florify Frontend: 5173

Make sure each service uses a unique port!
