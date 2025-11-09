# BridgeAI - Complete Fix Implementation Plan

## Status: Backend Running ✅
- ✅ Gemini API configured
- ✅ VAPI configured  
- ✅ SMTP configured
- ✅ Backend: http://localhost:4000
- ✅ Frontend: http://localhost:8082

---

## Issues to Fix:

### 1. Help Chatbot Doesn't Provide Real Locations/Contact Info
**Problem:** Chatbot gives generic responses, doesn't search real data

**Solution:**
- Connect Help page to `/api/ai/generate-response` and `/api/resources` endpoints
- Use Gemini AI to detect user intent (location request, contact info, etc.)
- Return actual shelter/food bank data with addresses and phone numbers
- Add location detection (browser geolocation API)

### 2. Dashboard Map Not Interactive
**Problem:** Map is static 2D visualization

**Solution:**
- Integrate Leaflet.js for interactive maps
- Add clickable markers with popups
- Show routes to nearest resources
- Add clustering for many requests
- Filter by category on map

### 3. Homeless Request Form with Voice Input
**Problem:** No easy way for homeless individuals to submit requests

**Solution:**
- Create new `/request` route for public users
- Add Web Speech API for voice input
- Simple, mobile-friendly form
- Location picker (GPS + manual address)
- Category selection with icons
- Submit directly to backend

---

## Implementation Steps:

1. Fix Help chatbot (connect to AI)
2. Add Leaflet map to Dashboard
3. Create public request form with voice
4. Enhance request details drawer

Files to modify:
- src/pages/Help.tsx
- src/components/MapView.tsx
- src/pages/Index.tsx (add Request route)
- Create: src/pages/RequestHelp.tsx
