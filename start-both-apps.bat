@echo off
echo Starting Florify Frontend and Replit Floorplan...
echo.

REM Start Florify Frontend on port 5173
start "Florify Frontend" cmd /k "cd /d C:\florify_webapp\florify-frontend && npm run dev"

REM Wait a few seconds
timeout /t 3 /nobreak > nul

REM Start Replit Floorplan on port 5174
start "Replit Floorplan" cmd /k "cd /d C:\florify_webapp\replit_floorplan\replit_floorplan && set PORT=5174 && npm run dev"

echo.
echo Both applications are starting...
echo Florify Frontend: http://localhost:5173
echo Replit Floorplan: http://localhost:5174
echo.
echo Press any key to exit (this will NOT stop the servers)
pause > nul
