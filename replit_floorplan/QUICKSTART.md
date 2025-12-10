# Quick Start Guide - Running Locally in VS Code

This guide will help you run the Floorplan Wizard webapp locally on your machine using VS Code.

## Prerequisites Check

1. **Node.js installed?**
   ```bash
   node --version
   ```
   Should show v20.x.x or higher. If not, download from https://nodejs.org/

2. **npm installed?**
   ```bash
   npm --version
   ```
   Should show version 9.x.x or higher (comes with Node.js)

## Step-by-Step Setup

### 1. Open Project in VS Code

```bash
# Open VS Code in the project directory
cd c:\replit3\replit_floorplan
code .
```

Or open VS Code and use `File → Open Folder` and select `c:\replit3\replit_floorplan`

### 2. Open Integrated Terminal

In VS Code:
- Press `` Ctrl + ` `` (backtick) to open the integrated terminal
- Or go to `Terminal → New Terminal`

### 3. Install Dependencies

In the terminal, run:
```bash
npm install
```

Wait for the installation to complete. This may take 2-5 minutes depending on your internet connection.

### 4. Start Development Server

```bash
npm run dev
```

You should see output like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose

serving on port 5174
```

### 5. Open in Browser

Open your browser and go to:
```
http://localhost:5174
```

🎉 **You're done!** The app should now be running.

## What's Running?

The application runs on port **5174** by default (frontend and backend served together).

## Making Changes

1. Edit any file in the `client/src` folder
2. Save the file (Ctrl+S)
3. The browser will automatically reload with your changes (Hot Module Replacement)

## Stopping the Server

In the terminal where the server is running:
- Press `Ctrl + C`
- Type `Y` if prompted to confirm

## Common Issues & Solutions

### ❌ "npm: command not found"
**Problem**: Node.js/npm not installed
**Solution**: Install Node.js from https://nodejs.org/

### ❌ "Port already in use" (EADDRINUSE)
**Problem**: Another app is using port 5174
**Solution**: 
```bash
# Option 1: Create .env file with different port
echo PORT=5175 > .env
echo NODE_ENV=development >> .env

# Option 2: Kill the conflicting process (Windows)
netstat -ano | findstr :5174
taskkill /PID <PID> /F
```

See [WINDOWS_PORT_FIX.md](./WINDOWS_PORT_FIX.md) for detailed troubleshooting.

### ❌ "Cannot find module"
**Problem**: Dependencies not installed properly
**Solution**:
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ❌ TypeScript errors in VS Code
**Problem**: VS Code using wrong TypeScript version
**Solution**:
1. Press `Ctrl+Shift+P`
2. Type "TypeScript: Select TypeScript Version"
3. Choose "Use Workspace Version"

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the code in `client/src` folder
- Check out the API routes in `server/routes.ts`
- Customize the UI components in `client/src/components`

## Need Help?

- Check the [README.md](./README.md) for more detailed information
- Review the troubleshooting section
- Check the browser console (F12) for errors
- Check the terminal for server errors

## Development Workflow

```bash
# Start development
npm run dev

# In another terminal, run type checking
npm run check

# Build for production
npm run build

# Run production build
npm start
```

Happy coding! 🚀

