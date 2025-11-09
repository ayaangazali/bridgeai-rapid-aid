# BridgeAI - Setup & Run Guide

## ✅ What's Been Done

1. **Backend Server Created** (`backend/server.js`)
   - Express REST API with Socket.IO
   - In-memory data store (requests & resources)
   - CORS enabled for frontend connection
   - Running on `http://localhost:4000`

2. **Frontend Wired to Backend** (`src/pages/Dashboard.tsx`)
   - Fetches requests/resources on mount
   - POST new requests via "Simulate Call" button
   - Assign/Resolve buttons call backend APIs
   - Graceful fallback to local state if backend unavailable

3. **Dependencies Installed**
   - Backend: ✅ Express, Socket.IO, CORS, Nodemon
   - Frontend: ✅ React, Vite, TypeScript, UI components

## 🚀 How to Run

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```
**Expected output:** `BridgeAI backend listening on 4000`

### Terminal 2: Start Frontend
```bash
npm run dev
```
**Expected output:** Vite dev server on `http://localhost:5173` (or similar)

## 🧪 Testing the Connection

1. Open the Dashboard: `http://localhost:5173/organization`
2. Click **"Simulate Call"** in the bottom admin bar
3. Watch a new request appear (fetched from backend)
4. Click **"Assign"** or **"Resolve"** on any request
5. Check backend terminal for API request logs

## 📡 Available API Endpoints

- `GET /api/requests` - Fetch all requests
- `POST /api/requests` - Create new request
- `POST /api/requests/:id/assign` - Mark as assigned
- `POST /api/requests/:id/resolve` - Mark as resolved
- `GET /api/resources` - Fetch all resources (food banks, shelters)
- `GET /health` - Health check

## 🔧 Known Notes

### TypeScript Errors in Editor
The VS Code TypeScript server may show import errors after fresh install. These are false positives:
- **Solution**: Reload VS Code window (`Cmd+Shift+P` → "Reload Window")
- **Or**: Restart TypeScript server (`Cmd+Shift+P` → "TypeScript: Restart TS Server")
- The app will still run fine despite these editor warnings

### Backend Process Management
Backend runs with `nodemon` which auto-restarts on file changes.
- Stop: `Ctrl+C` in the terminal
- Restart manually: Type `rs` in the nodemon terminal

## 🎯 Next Steps

1. **Add Socket.IO Client** - Real-time updates when requests created/updated
2. **MongoDB Integration** - Replace in-memory store with persistent database
3. **Authentication** - Add volunteer/org login flow
4. **AI Features**:
   - Tone detection endpoint (sentiment analysis)
   - Food surplus matching (image recognition)
   - Call-back memory (vector store for conversation history)

## 🐛 Troubleshooting

**Backend won't start:**
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

**Frontend won't start:**
```bash
rm -rf node_modules
npm install
npm run dev
```

**Port 4000 already in use:**
```bash
# Find and kill the process
lsof -ti:4000 | xargs kill -9
# Then restart backend
```

**CORS errors in browser:**
- Backend already has `cors()` enabled
- Check that backend is running on port 4000
- Clear browser cache or use incognito mode

---

## 📝 Architecture

```
Frontend (React + Vite)          Backend (Express + Socket.IO)
    Port 5173                           Port 4000
        |                                    |
        |-------- HTTP/REST API ----------->|
        |         (fetch calls)              |
        |                                    |
        |<------- JSON responses -----------|
        |                                    |
        |-------- Socket.IO (future) ------>|
                  (real-time events)
```

**Data Flow:**
1. Dashboard mounts → `useEffect` → `fetch('/api/requests')`
2. Backend returns `{ requests: [...] }`
3. Dashboard updates state → UI renders
4. User clicks "Assign" → `POST /api/requests/:id/assign`
5. Backend updates data → emits Socket event → returns updated request
6. Dashboard updates state → UI re-renders

✅ **You're all set!** Backend is connected to frontend.
