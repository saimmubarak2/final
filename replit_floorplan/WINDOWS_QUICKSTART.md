# Windows Quick Start Guide

## The Error You're Seeing

```
Error: listen EADDRINUSE: address already in use ::1:5001
code: 'EADDRINUSE',
errno: -4091,
syscall: 'listen',
address: '::1',
port: 5001
```

This means port 5001 is already in use. **The fix is simple!**

## Quick Fix (Choose One)

### Option 1: Use the Batch File (Easiest)

1. Navigate to the project root:
   ```cmd
   cd C:\florify_webapp\replit_floorplan
   ```

2. Double-click `start-dev.bat` or run:
   ```cmd
   start-dev.bat
   ```

This will:
- Automatically create a `.env` file with PORT=5174
- Start the dev server
- Open at http://localhost:5174

### Option 2: Create .env File Manually

1. Navigate to the project root:
   ```cmd
   cd C:\florify_webapp\replit_floorplan
   ```

2. Create a `.env` file:
   ```cmd
   echo PORT=5174> .env
   echo NODE_ENV=development>> .env
   ```

3. Run the dev server:
   ```cmd
   npm run dev
   ```

4. Open http://localhost:5174

### Option 3: Kill the Process on Port 5001

1. Find what's using port 5001:
   ```powershell
   netstat -ano | findstr :5001
   ```

2. Note the PID (last column), then kill it:
   ```powershell
   taskkill /PID <PID_NUMBER> /F
   ```

3. Run the dev server:
   ```cmd
   npm run dev
   ```

## Common Mistakes

### ❌ WRONG: Running from client directory
```
cd C:\florify_webapp\replit_floorplan\client
npm run dev  # This won't work!
```

### ✅ CORRECT: Running from root directory
```
cd C:\florify_webapp\replit_floorplan
npm run dev  # This is correct!
```

## Port Summary

| Application | Default Port | Can Change? |
|------------|--------------|-------------|
| Floorplan Builder | 5174 | Yes (via .env) |
| AI Backend | 5001 | Yes |
| Florify Frontend | 5173 | Yes |

**Make sure each service uses a different port!**

## Step-by-Step Fresh Setup

1. **Navigate to the project root**
   ```cmd
   cd C:\florify_webapp\replit_floorplan
   ```

2. **Install dependencies** (if not done already)
   ```cmd
   npm install
   ```

3. **Create .env file**
   ```cmd
   echo PORT=5174> .env
   echo NODE_ENV=development>> .env
   ```

4. **Start the dev server**
   ```cmd
   npm run dev
   ```

5. **Open your browser**
   - Go to: http://localhost:5174
   - You should see the Floorplan Wizard

## Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal/PowerShell

### "Cannot find module"
```cmd
npm install
```

### Port still in use after killing process
Try a different port:
```cmd
echo PORT=5175> .env
echo NODE_ENV=development>> .env
npm run dev
```

### Changes not showing in browser
- Hard refresh: `Ctrl + Shift + R`
- Or clear browser cache

### TypeScript errors
```cmd
npm run check
```

## What's Running?

When you run `npm run dev`, you get:
- ✅ Frontend (React + Vite)
- ✅ Backend (Express API)
- ✅ Hot Module Replacement
- ✅ Auto-reload on changes

All served from a single port (5174 by default).

## Need More Help?

- 📖 Full docs: [README.md](./README.md)
- 🔧 Port issues: [WINDOWS_PORT_FIX.md](./WINDOWS_PORT_FIX.md)
- 🚀 Local setup: [LOCAL_SETUP.md](./LOCAL_SETUP.md)

## Success Checklist

- [ ] Node.js installed (v20+)
- [ ] In correct directory (root, not client)
- [ ] Dependencies installed (`npm install`)
- [ ] .env file created with PORT=5174
- [ ] No other service using port 5174
- [ ] Server running (`npm run dev`)
- [ ] Browser open to http://localhost:5174

If all checked, you're good to go! 🎉
