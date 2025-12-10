# Florify Integration - Complete Setup Guide

## 🎯 Overview

This integration connects the Florify garden management app with the Replit floorplan blueprint editor. Users can now create garden blueprints directly within their garden creation workflow, with data seamlessly synchronized between both applications.

---

## 📦 What's New

### Backend Changes

#### 1. New DynamoDB Table: `florify-blueprints-dev`
```
Schema:
- userId (Partition Key)
- blueprintId (Sort Key)  
- gardenId
- name
- blueprintData (JSON)
- createdAt
- updatedAt

Global Secondary Index:
- GardenIdIndex (gardenId as partition key)
```

#### 2. New Lambda Functions
- `create-blueprint` - POST /blueprints
- `get-blueprint` - GET /blueprints/{blueprintId}
- `get-blueprint-by-garden` - GET /gardens/{gardenId}/blueprint
- `update-blueprint` - PUT /blueprints/{blueprintId}

#### 3. New Handler Files
- `create_blueprint_handler.py`
- `get_blueprint_handler.py`
- `get_blueprint_by_garden_handler.py`
- `update_blueprint_handler.py`

### Frontend Changes

#### 1. New API Module
- `florify-frontend/src/api/blueprints.js` - Blueprint CRUD operations

#### 2. Modified Components

**CreateGardenWizard.jsx**
- Added Step 4: Blueprint creation
- Integration with replit_floorplan via window.open()
- PostMessage API to receive blueprint data
- Automatic save to backend

**LandingPage.jsx**
- Removed standalone "Create Blueprint" button
- Removed EmptyGardenWizard import and state
- Simplified navigation

**GardenDetailPage.jsx**
- Added "View Blueprint" button
- Loads existing blueprint for garden
- Opens replit_floorplan in edit mode with auto-navigation to export step

### Replit Floorplan Changes

#### 1. URL Parameter Handling
```
?mode=create&garden_id=<ID>&user_id=<ID>           # Create new blueprint
?mode=edit&blueprint_id=<ID>&auto_step=export      # Edit existing
```

#### 2. Modified Files

**client/src/pages/Floorplan.tsx**
- URL parameter parsing
- Load existing blueprint from Florify API
- Auto-navigate to export step when `auto_step=export`
- `handleSaveToFlorify()` - Send data via postMessage or API
- "Save to Garden" / "Update Garden Blueprint" button

**vite.config.ts**
- Changed port to 5174 (from default 5173)
- Added strictPort option

**server/index.ts**
- Changed default backend port to 5001 (from 5000)

---

## 🚀 Deployment Instructions

### Step 1: Deploy Backend Changes

```powershell
cd c:\florify_webapp\backend
serverless deploy --stage dev
```

This will:
- Create the new BlueprintsTable in DynamoDB
- Deploy 4 new Lambda functions
- Update API Gateway routes
- Set up the GardenIdIndex

**Expected Output:**
```
endpoints:
  POST - .../dev/blueprints
  GET - .../dev/blueprints/{blueprintId}
  GET - .../dev/gardens/{gardenId}/blueprint
  PUT - .../dev/blueprints/{blueprintId}
```

### Step 2: Install Dependencies (if needed)

**Florify Frontend:**
```powershell
cd c:\florify_webapp\florify-frontend
npm install
```

**Replit Floorplan:**
```powershell
cd c:\florify_webapp\replit_floorplan\replit_floorplan
npm install
```

### Step 3: Start Applications

**Option A: Use the start script**
```powershell
cd c:\florify_webapp
.\start-all.bat
```

**Option B: Manual start**
```powershell
# Terminal 1 - Florify Frontend
cd c:\florify_webapp\florify-frontend
npm run dev

# Terminal 2 - Replit Floorplan
cd c:\florify_webapp\replit_floorplan\replit_floorplan
npm run dev
```

---

## 🔄 User Flow

### Creating a Garden with Blueprint

1. **User logs into Florify** → Lands on dashboard
2. **Clicks "ADD GARDEN"** → Garden creation wizard opens
3. **Steps through wizard:**
   - Step 1: Garden Details (name, description)
   - Step 2: Location (map selection)
   - Step 3: Photo (optional image upload)
   - Step 4: Blueprint (NEW!)
4. **Clicks "OPEN BLUEPRINT EDITOR"** → New tab opens with replit_floorplan
   - URL: `http://localhost:5174/?mode=create&garden_id=<ID>&user_id=<ID>`
5. **User designs floorplan** through 7-step wizard:
   - Plot Size
   - House Shape
   - Add Doors
   - Walls
   - Driveways
   - Pathways
   - Patios
   - Export/Save
6. **Clicks "Save to Garden"** → Blueprint data sent to Florify via postMessage
7. **Blueprint saved** → Florify receives data, saves to backend, closes wizard
8. **Garden created** with linked blueprint

### Editing Existing Blueprint

1. **User navigates to "Your Gardens"**
2. **Clicks on a garden** → Garden detail page opens
3. **If blueprint exists**, "📐 View Blueprint" button appears
4. **Clicks "View Blueprint"** → Replit floorplan opens in new tab
   - URL: `http://localhost:5174/?mode=edit&blueprint_id=<ID>&garden_id=<ID>&user_id=<ID>&auto_step=export`
   - Automatically loads to Export/Save step with existing design
5. **User modifies design** (can navigate back through steps)
6. **Clicks "Update Garden Blueprint"** → Changes saved via API
7. **Success notification** → Blueprint updated in database

---

## 🔌 API Integration Details

### PostMessage Protocol (Create Mode)

**From replit_floorplan to Florify:**
```javascript
window.opener.postMessage({
  type: 'BLUEPRINT_SAVED',
  blueprintData: {
    shapes: [...],
    doors: [...],
    driveways: [...],
    pathways: [...],
    patios: [...],
    viewTransform: {...},
    currentStep: '...'
  },
  gardenId: '...',
  userId: '...'
}, 'http://localhost:5173');
```

**Florify listener (CreateGardenWizard.jsx):**
```javascript
window.addEventListener('message', async (event) => {
  if (event.origin !== 'http://localhost:5174') return;
  
  if (event.data.type === 'BLUEPRINT_SAVED') {
    await createBlueprint({
      gardenId: event.data.gardenId,
      blueprintData: event.data.blueprintData,
      name: `${formData.name} Blueprint`
    });
  }
});
```

### REST API Calls (Edit Mode)

**Load Blueprint:**
```javascript
GET /blueprints/{blueprintId}
Authorization: Bearer <JWT>

Response: {
  blueprint: {
    blueprintId,
    gardenId,
    userId,
    blueprintData: {...},
    createdAt,
    updatedAt
  }
}
```

**Update Blueprint:**
```javascript
PUT /blueprints/{blueprintId}
Authorization: Bearer <JWT>
Body: {
  blueprintData: {...}
}
```

---

## 🔒 Security Considerations

1. **JWT Token Validation**
   - All blueprint APIs require valid JWT token
   - Token extracted from Authorization header
   - User ID validated against blueprint ownership

2. **Cross-Origin Communication**
   - PostMessage origin validation: `http://localhost:5173`
   - CORS enabled for blueprint endpoints

3. **Data Isolation**
   - DynamoDB partition key ensures user-specific access
   - No cross-user blueprint visibility

---

## 🐛 Troubleshooting

### Issue: "Failed to save blueprint"
**Cause:** Backend not deployed or token expired
**Fix:** 
```powershell
cd c:\florify_webapp\backend
serverless deploy --stage dev
```

### Issue: Replit floorplan won't open
**Cause:** Port 5174 not available or app not running
**Fix:**
```powershell
cd c:\florify_webapp\replit_floorplan\replit_floorplan
npm run dev
```

### Issue: Blueprint data not loading in edit mode
**Cause:** Blueprint doesn't exist or API error
**Check:**
1. Verify blueprint exists: `GET /gardens/{gardenId}/blueprint`
2. Check browser console for errors
3. Verify JWT token is valid

### Issue: PostMessage not working
**Cause:** Origin mismatch or window.opener null
**Check:**
1. Verify Florify runs on http://localhost:5173
2. Verify replit_floorplan runs on http://localhost:5174
3. Ensure blueprint window opened via window.open(), not direct navigation

---

## 📊 Database Schema

### BlueprintsTable
```typescript
{
  userId: string;          // Cognito sub from JWT
  blueprintId: string;     // UUID
  gardenId: string;        // Foreign key to GardensTable
  name: string;           // "Garden Name Blueprint"
  blueprintData: {        // Complete floorplan state
    shapes: FloorplanShape[];
    doors: Door[];
    driveways: Driveway[];
    pathways: Pathway[];
    patios: Patio[];
    viewTransform: ViewTransform;
    currentStep: WizardStep;
  };
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
}
```

---

## 🎨 UI/UX Improvements

1. **Seamless Integration**
   - Blueprint creation embedded in garden wizard
   - No separate workflow confusion

2. **Visual Feedback**
   - Toast notifications for save success/failure
   - Loading states during API calls

3. **Smart Defaults**
   - Auto-navigate to export step when viewing existing blueprint
   - Pre-fill blueprint name from garden name

4. **Error Handling**
   - Graceful degradation if blueprint fails to load
   - Retry mechanisms for network errors

---

## 🔄 Future Enhancements

1. **Inline Preview**
   - Show blueprint thumbnail on garden card
   - Quick preview without opening editor

2. **Export Integration**
   - Automatically attach PDF to garden record
   - Email blueprint to user

3. **Collaboration**
   - Share blueprint link with others
   - Real-time collaborative editing

4. **AI Suggestions**
   - Auto-suggest optimal layouts based on garden dimensions
   - Plant placement recommendations

5. **Version History**
   - Track blueprint revisions
   - Restore previous versions

---

## 📖 API Reference

### Blueprint Endpoints

#### Create Blueprint
```
POST /blueprints
Authorization: Bearer <token>
Body: {
  gardenId: string,
  blueprintData: object,
  name?: string
}
Response: { blueprint: Blueprint }
```

#### Get Blueprint
```
GET /blueprints/{blueprintId}
Authorization: Bearer <token>
Response: { blueprint: Blueprint }
```

#### Get Blueprint by Garden
```
GET /gardens/{gardenId}/blueprint
Authorization: Bearer <token>
Response: { blueprint: Blueprint | null }
```

#### Update Blueprint
```
PUT /blueprints/{blueprintId}
Authorization: Bearer <token>
Body: {
  name?: string,
  blueprintData?: object
}
Response: { blueprint: Blueprint }
```

---

## ✅ Testing Checklist

### Create Flow
- [ ] Garden wizard opens correctly
- [ ] Step 4 (Blueprint) displays after photo step
- [ ] "Open Blueprint Editor" button works
- [ ] New tab opens with correct URL parameters
- [ ] Replit floorplan loads in create mode
- [ ] User can design floorplan through all steps
- [ ] "Save to Garden" button appears on export step
- [ ] PostMessage sends data back to Florify
- [ ] Blueprint saves to backend successfully
- [ ] Garden wizard closes after save
- [ ] New garden appears with blueprint link

### Edit Flow
- [ ] Garden detail page shows "View Blueprint" button (only if blueprint exists)
- [ ] Button click opens new tab
- [ ] URL includes blueprint_id and auto_step=export
- [ ] Replit floorplan loads existing design
- [ ] Canvas shows all previously drawn elements
- [ ] Export step opens automatically
- [ ] User can navigate back to edit
- [ ] "Update Garden Blueprint" button appears
- [ ] API call updates blueprint successfully
- [ ] Toast shows success message

### Error Handling
- [ ] Invalid blueprint ID shows error message
- [ ] Network failures display user-friendly error
- [ ] Token expiration triggers re-login
- [ ] Cross-origin postMessage rejects invalid origins

---

## 🌟 Key Benefits

✅ **Seamless Workflow** - No context switching between apps  
✅ **Data Persistence** - Blueprints saved and retrievable  
✅ **Professional Tools** - Full CAD-like drawing capabilities  
✅ **Export Options** - PNG/PDF at multiple DPI levels  
✅ **User-Friendly** - Guided wizard interface  
✅ **Secure** - JWT authentication and user isolation  
✅ **Scalable** - Serverless architecture handles growth  

---

## 📞 Support

For issues or questions:
1. Check CloudWatch logs for Lambda errors
2. Inspect browser console for frontend errors
3. Verify all services are running on correct ports
4. Ensure backend is deployed with latest changes

---

**Integration Complete! 🎉**
