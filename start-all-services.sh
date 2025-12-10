#!/bin/bash
# Start all Florify services for development

echo "🌿 Starting Florify Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start AI Processing Backend
echo -e "${BLUE}Starting AI Processing Backend on port 5001...${NC}"
cd /workspace/backend/ai_processing
python app.py &
AI_PID=$!
echo -e "${GREEN}AI Backend started (PID: $AI_PID)${NC}"

# Wait a moment for AI backend to start
sleep 2

# Start Replit Floorplan Builder
echo -e "${BLUE}Starting Replit Floorplan Builder on port 5174...${NC}"
cd /workspace/replit_floorplan
npm run dev &
FLOORPLAN_PID=$!
echo -e "${GREEN}Floorplan Builder started (PID: $FLOORPLAN_PID)${NC}"

# Wait a moment
sleep 2

# Start Florify Frontend
echo -e "${BLUE}Starting Florify Frontend on port 5173...${NC}"
cd /workspace/florify-frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Florify Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}=== All Services Started ===${NC}"
echo "• Florify Frontend: http://localhost:5173"
echo "• Floorplan Builder: http://localhost:5174"
echo "• AI Processing API: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for any process to exit
wait

# Cleanup
kill $AI_PID $FLOORPLAN_PID $FRONTEND_PID 2>/dev/null
