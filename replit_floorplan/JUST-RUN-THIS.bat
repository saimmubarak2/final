@echo off
echo.
echo ========================================
echo   FLOORPLAN BUILDER - STARTING
echo ========================================
echo.

REM Check if in correct directory
if not exist "package.json" (
    echo ERROR: Not in correct directory!
    echo Please run from: C:\florify_webapp\replit_floorplan
    echo.
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed!
    echo Install from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Install if needed
if not exist "node_modules" (
    echo Installing dependencies (first time only)...
    npm install
)

REM Start
echo.
echo Starting Floorplan Builder...
echo.
echo Open browser to: http://localhost:5174
echo.
echo Press Ctrl+C to stop
echo.

npm run dev

pause
