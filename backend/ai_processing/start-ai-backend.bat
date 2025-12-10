@echo off
REM ==============================================
REM  Florify AI Backend Startup Script (Windows)
REM ==============================================

echo.
echo ========================================
echo   Florify AI Processing Backend
echo ========================================
echo.

REM Check if we're in the correct directory
if not exist "app.py" (
    echo ERROR: app.py not found!
    echo.
    echo Please run this script from: C:\florify_webapp\backend\ai_processing
    echo.
    pause
    exit /b 1
)

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python 3.10+ from: https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo Python found!
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to create virtual environment
        echo.
        pause
        exit /b 1
    )
    echo Virtual environment created!
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo.
    echo ERROR: Failed to activate virtual environment
    echo.
    pause
    exit /b 1
)

echo.
echo Installing/updating dependencies...
echo (This may take a minute on first run)
echo.

REM Install minimal requirements for quick start
pip install -q flask flask-cors pillow numpy python-dotenv
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    echo.
    echo Try running manually:
    echo   venv\Scripts\activate
    echo   pip install flask flask-cors pillow numpy python-dotenv
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Starting AI Processing Server
echo ========================================
echo.
echo Server will run on: http://localhost:5001
echo Health check: http://localhost:5001/health
echo.
echo Press Ctrl+C to stop the server
echo.
echo ----------------------------------------
echo.

REM Start the Flask app
python app.py

REM This runs when server stops
echo.
echo Server stopped.
pause
