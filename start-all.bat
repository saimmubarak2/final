@echo off
REM ================================================
REM  START ALL FLORIFY APPLICATIONS
REM ================================================

echo.
echo ================================================
echo   FLORIFY PROJECT - MASTER STARTUP
echo ================================================
echo.
echo This will start all three applications:
echo.
echo   1. Florify Frontend (Port 5173)
echo   2. AI Backend (Port 5001)
echo   3. Floorplan Builder (Port 5174)
echo.
echo Each will open in a separate window.
echo.
pause

REM Start AI Backend
echo.
echo Starting AI Backend...
start "Florify AI Backend" cmd /k "cd /d %~dp0backend\ai_processing && start-ai-backend.bat"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Florify Frontend
echo Starting Florify Frontend...
start "Florify Frontend" cmd /k "cd /d %~dp0florify-frontend && npm run dev"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Floorplan Builder
echo Starting Floorplan Builder...
start "Floorplan Builder" cmd /k "cd /d %~dp0replit_floorplan && npm run dev"

echo.
echo ================================================
echo   All applications are starting...
echo ================================================
echo.
echo Windows opened:
echo   - AI Backend: http://localhost:5001
echo   - Florify Frontend: http://localhost:5173
echo   - Floorplan Builder: http://localhost:5174
echo.
echo Wait a few seconds for all servers to start.
echo Then open your browser to the URLs above.
echo.
echo Press Ctrl+C in each window to stop that server.
echo.
echo ================================================
echo.
pause
