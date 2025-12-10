#!/bin/bash
# Startup script for AI Processing Backend

echo "🚀 Starting Florify AI Processing Server..."

# Set environment variables
export PORT=5001
export DEBUG=true

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# Start the server
echo "🌿 Starting AI server on port $PORT..."
python app.py
