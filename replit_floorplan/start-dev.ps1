# Floorplan Wizard - Development Server Launcher
# This script starts the development server with proper port configuration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Floorplan Wizard - Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
$currentDir = (Get-Item -Path ".\").BaseName
if ($currentDir -eq "client") {
    Write-Host "❌ ERROR: You're in the client directory!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run this script from the project root:" -ForegroundColor Yellow
    Write-Host "  cd .." -ForegroundColor White
    Write-Host "  .\start-dev.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is NOT installed" -ForegroundColor Red
    Write-Host "  Install from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}

# Create .env file if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Creating .env file with default settings..." -ForegroundColor Yellow
    @"
PORT=5174
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ Created .env file with PORT=5174" -ForegroundColor Green
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    
    # Check what port is configured
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "PORT=(\d+)") {
        $configuredPort = $matches[1]
        Write-Host "  Configured port: $configuredPort" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the port from .env or use default
$port = "5174"
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "PORT=(\d+)") {
        $port = $matches[1]
    }
}

Write-Host "Application will be available at:" -ForegroundColor Green
Write-Host "  http://localhost:$port" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Start the development server
npm run dev

# This will only execute if npm run dev exits
Write-Host ""
Write-Host "Server stopped." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
