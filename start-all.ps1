# ================================================
# START ALL FLORIFY APPLICATIONS (PowerShell)
# ================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   FLORIFY PROJECT - MASTER STARTUP" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will start all three applications:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Florify Frontend (Port 5173)" -ForegroundColor White
Write-Host "  2. AI Backend (Port 5001)" -ForegroundColor White
Write-Host "  3. Floorplan Builder (Port 5174)" -ForegroundColor White
Write-Host ""
Write-Host "Each will open in a separate window." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start AI Backend
Write-Host ""
Write-Host "Starting AI Backend..." -ForegroundColor Green
$aiPath = Join-Path $scriptDir "backend\ai_processing"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$aiPath'; .\start-ai-backend.bat"

# Wait a moment
Start-Sleep -Seconds 2

# Start Florify Frontend
Write-Host "Starting Florify Frontend..." -ForegroundColor Green
$frontendPath = Join-Path $scriptDir "florify-frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

# Start Floorplan Builder
Write-Host "Starting Floorplan Builder..." -ForegroundColor Green
$floorplanPath = Join-Path $scriptDir "replit_floorplan"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$floorplanPath'; npm run dev"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   All applications are starting..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Windows opened:" -ForegroundColor Yellow
Write-Host "  - AI Backend: http://localhost:5001" -ForegroundColor White
Write-Host "  - Florify Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  - Floorplan Builder: http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "Wait 10-20 seconds for all servers to start." -ForegroundColor Yellow
Write-Host "Then open your browser to the URLs above." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop that server." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
