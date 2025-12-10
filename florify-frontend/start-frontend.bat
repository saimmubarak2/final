@echo off
REM ==============================================
REM  Florify Frontend Startup Script (Windows)
REM ==============================================

echo.
echo ========================================
echo   Florify Frontend
echo ========================================
echo.

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo.
    echo Please run this script from: C:\florify_webapp\florify-frontend
    echo.
    pause
    exit /b 1
)

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo (This may take a few minutes on first run)
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed!
    echo.
)

echo.
echo ========================================
echo   Starting Florify Frontend
echo ========================================
echo.
echo Application will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.
echo ----------------------------------------
echo.

REM Start the dev server
npm run dev

REM This runs when server stops
echo.
echo Server stopped.
pause
