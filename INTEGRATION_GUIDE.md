# Florify Garden Planning App - Integration Guide

## Overview

This guide explains the complete integration of the Replit Floorplan Builder with the Florify Garden Planning App, including the AI-powered garden layout generation using blueprint embeddings and YOLO symbol detection.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Florify Frontend (React)                     │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────────┐│
│  │ Landing Page│  │Garden Detail Page│  │Create Garden Wizard  ││
│  └──────┬──────┘  └────────┬─────────┘  └──────────┬───────────┘│
│         │                  │                       │            │
│         └──────────────────┼───────────────────────┘            │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌────────────────┐   ┌───────────────────┐
│  Replit       │   │ Florify        │   │ AI Processing     │
│  Floorplan    │   │ Serverless     │   │ Backend           │
│  Builder      │   │ Backend (AWS)  │   │ (Flask)           │
│  (React/TS)   │   │                │   │                   │
│               │   │ - Gardens API  │   │ - Blueprint Match │
│  Port: 5174   │   │ - Blueprints   │   │ - YOLO Detection  │
│               │   │   API          │   │                   │
└───────────────┘   └────────────────┘   │ Port: 5001        │
                                         └───────────────────┘
```

## User Flow

### 1. Garden Creation Wizard (4 Steps)

1. **Step 1 - Garden Name**: User enters a name for their garden
2. **Step 2 - Location**: User selects a city in Pakistan from dropdown
3. **Step 3 - Description**: User adds an optional description
4. **Step 4 - Create Floorplan**: Opens the Replit Floorplan Builder

### 2. Floorplan Builder

The Replit Floorplan Builder is a comprehensive 8-step wizard:
- **Plot Size**: Define plot boundaries (1 Kanal, 10 Marla, 5 Marla presets)
- **House Shape**: Add rectangular, L-shaped, or custom house shapes
- **Add Doors**: Place doors on house walls
- **Walls**: Draw interior/exterior walls
- **Add Driveways**: Configure driveways with surface types
- **Add Pathways**: Draw freehand pathways
- **Add Patios**: Add wooden, marble, or concrete patios
- **Export/Save**: Export PNG (with/without skin) and save to garden

### 3. AI-Powered Garden Layout Generation

When user clicks "Generate Garden Layout":

#### Phase 2: Blueprint Matching
1. Takes the non-skinned PNG (blueprint without visual styling)
2. Extracts features using MobileNetV2
3. Compares with pre-computed embeddings database
4. Finds the best matching "filled" blueprint template
5. Returns the processed blueprint with plant symbols

#### Phase 3: Symbol Detection
1. Runs YOLO model on the processed blueprint
2. Detects all garden symbols (trees, shrubs, flowers, etc.)
3. Parses class names to extract properties:
   - Category (Tree, Shrub, Perennial, Annual, etc.)
   - Flowering status
   - Size (Small, Medium, Large)
   - Fruiting status
   - Leaf type (Broad, Thin, Needle, Palm)
   - Growth type (Evergreen, Deciduous)
4. Returns labeled image and CSV report

### 4. Interactive Overlay

The Garden Detail page displays:
- **Skinned View**: Original blueprint with visual styling
- **Processed Blueprint**: Matched template with plant symbols
- **Symbol Detection**: YOLO-labeled image showing all detected symbols
- **Interactive View**: Hoverable markers on the skinned image showing symbol details

## Directory Structure

```
/workspace/
├── florify-frontend/               # Main Florify React app
│   ├── src/
│   │   ├── api/
│   │   │   ├── aiProcessing.js     # AI backend API calls
│   │   │   ├── blueprints.js       # Blueprint CRUD
│   │   │   └── gardens.js          # Garden CRUD
│   │   ├── components/
│   │   │   ├── InteractiveOverlay/ # Symbol markers overlay
│   │   │   └── SimpleCreateGardenWizard.jsx
│   │   └── pages/
│   │       └── GardenDetailPage.jsx  # AI results display
│
├── replit_floorplan/               # Floorplan Builder (standalone)
│   ├── client/                     # React/TypeScript frontend
│   └── server/                     # Express backend
│
├── backend/
│   ├── ai_processing/              # AI Processing Backend
│   │   ├── app.py                  # Flask API server
│   │   ├── blueprint_processor.py  # Embedding/FAISS logic
│   │   ├── symbol_detector.py      # YOLO detection logic
│   │   └── requirements.txt
│   │
│   ├── blueprint_embeddings_db/    # Pre-computed embeddings
│   │   ├── database.pkl            # Blueprint pairs metadata
│   │   ├── faiss_index.bin         # FAISS similarity index
│   │   ├── feature_extractor.pth   # MobileNetV2 weights
│   │   └── png_cache/
│   │       ├── empty/              # 1134 empty blueprints
│   │       └── filled/             # 1134 filled blueprints
│   │
│   └── *.py                        # Serverless Lambda handlers
│
└── best (2).pt                     # YOLO model weights
```

## Running the Application

### Start Florify Frontend
```bash
cd /workspace/florify-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Start Replit Floorplan Builder
```bash
cd /workspace/replit_floorplan
npm install
npm run dev
# Runs on http://localhost:5174
```

### Start AI Processing Backend
```bash
cd /workspace/backend/ai_processing
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5001
```

## API Endpoints

### AI Processing Backend (localhost:5001)

#### Health Check
```
GET /health
```

#### Process Blueprint (Phase 2)
```
POST /api/process-blueprint
Body: {
  "image": "base64_encoded_png",
  "min_similarity": 0.7
}
```

#### Detect Symbols (Phase 3)
```
POST /api/detect-symbols
Body: {
  "image": "base64_encoded_png",
  "conf_threshold": 0.25
}
```

#### Full Pipeline (Phase 2 + 3)
```
POST /api/process-full-pipeline
Body: {
  "non_skinned_image": "base64_encoded_png",
  "skinned_image": "base64_encoded_png",
  "min_similarity": 0.7,
  "conf_threshold": 0.25
}
Response: {
  "success": true,
  "phase2": { "filled_image_base64": "...", "similarity": 0.85 },
  "phase3": { "detections": [...], "labeled_image_base64": "...", "summary": {...} },
  "overlay_data": [...],
  "csv": "..."
}
```

## Class Name Parsing

The YOLO model detects symbols with structured class names:

```
Pattern: {Category}_{Height}_{CanopySize}_{GrowthType}_{FloweringStatus}_{FruitingStatus}

Examples:
- Tree_Height2_CanopySize2_Evergreen_Flowering_NONFruiting
- Shrub_Height1_CanopySize1_Deciduous_NONFlowering_Fruiting
- perennials_Height1_CanopySize2_Evergreen_BroadLeafed_Flowering
```

### Parsed Properties:

| Property | Values |
|----------|--------|
| Category | Tree, Shrub, Perennial, Annual, Climber, Rock, FlowerPot, Object |
| Size | Small (Height1/CanopySize1), Medium (Height2/CanopySize2), Large (Height3+/CanopySize3+) |
| Flowering | true/false (based on Flowering vs NONFlowering) |
| Fruiting | true/false (based on Fruiting vs NONFruiting) |
| Leaf Type | Broad Leaf, Thin Leaf, Needle Leaf, Palm |
| Growth Type | Evergreen, Deciduous |

## Interactive Overlay Features

The Interactive Overlay component displays:
- **Colored markers** at detected symbol positions
- **Color coding** by category (Trees=green, Shrubs=lime, etc.)
- **Hover tooltips** showing:
  - Class name
  - Category
  - Size
  - Flowering/Fruiting status
  - Leaf type
  - Growth type
  - Detection confidence
  - Position coordinates
- **Legend** explaining marker colors
- **Flowering indicator** (🌸) for flowering plants

## Database Schema

### Gardens Table (DynamoDB)
```json
{
  "userId": "string (PK)",
  "gardenId": "string (SK)",
  "name": "string",
  "location": "string",
  "description": "string",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

### Blueprints Table (DynamoDB)
```json
{
  "userId": "string (PK)",
  "blueprintId": "string (SK)",
  "gardenId": "string (GSI)",
  "blueprintData": {
    "shapes": [...],
    "doors": [...],
    "driveways": [...],
    "pathways": [...],
    "patios": [...]
  },
  "pngImage": "base64 string",
  "skinnedPng": "base64 string",
  "nonSkinnedPng": "base64 string",
  "aiResults": {
    "phase2": {...},
    "phase3": {...},
    "overlay_data": [...]
  },
  "createdAt": "ISO timestamp"
}
```

## Troubleshooting

### AI Service Not Available
- Ensure the AI backend is running on port 5001
- Check that all Python dependencies are installed
- Verify the embeddings database exists at `/workspace/backend/blueprint_embeddings_db/`

### Blueprint Not Saving
- Ensure the Florify serverless backend is deployed
- Check browser console for CORS errors
- Verify the auth token is valid

### YOLO Model Not Loading
- Ensure `best (2).pt` exists at `/workspace/best (2).pt`
- Install ultralytics: `pip install ultralytics`

## Future Enhancements

1. **Real-time Collaboration**: Multiple users editing the same blueprint
2. **Plant Recommendations**: AI-suggested plants based on location/climate
3. **3D Visualization**: Convert 2D blueprints to 3D garden views
4. **Seasonal Simulation**: Show how garden looks in different seasons
5. **Mobile App**: Native iOS/Android apps for garden planning
