@echo off
echo Starting Florify Application Suite...
echo.
echo Starting Florify Frontend (Port 5173)...
start "Florify Frontend" cmd /k "cd /d c:\florify_webapp\florify-frontend && npm run dev"

timeout /t 2 /nobreak > nul

echo Starting Replit Floorplan (Port 5174)...
start "Replit Floorplan" cmd /k "cd /d c:\florify_webapp\replit_floorplan\replit_floorplan && npm run dev"

echo.
echo ========================================
echo Florify Application Suite Started!
echo ========================================
echo.
echo Florify Frontend:  http://localhost:5173
echo Floorplan Editor:  http://localhost:5174
echo.
echo Backend API:       https://jiazehdrvf.execute-api.eu-north-1.amazonaws.com/dev
echo.
echo Press any key to exit (applications will continue running)...
pause > nul
