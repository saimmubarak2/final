@echo off
echo ========================================
echo   Floorplan Wizard - Development Server
echo ========================================
echo.
echo Starting development server...
echo.
echo Application will be available at: http://localhost:5174
echo (Both frontend and backend served together)
echo.
echo Press Ctrl+C to stop the server
echo.
echo.

REM Check if .env file exists, if not create it
if not exist .env (
    echo Creating .env file with default settings...
    echo PORT=5174> .env
    echo NODE_ENV=development>> .env
    echo.
)

npm run dev
pause

