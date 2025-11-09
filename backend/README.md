# BridgeAI Backend

FastAPI backend for AI-Powered Rapid Support Network

## Quick Start

```bash
./start.sh
```

That's it! The backend will start on `http://localhost:4000`

## What It Does

- ✅ Serves 7 SF homeless resources (food, shelter, medical, legal)
- ✅ AI tone analysis with Gemini
- ✅ AI response generation
- ✅ Resource search with distance calculation
- ✅ Request management (create, assign, resolve)
- ✅ VAPI voice call integration
- ✅ Full CORS support for frontend

## API Endpoints

### Health
- `GET /` - Health check

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources/search` - Search nearby resources

### Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create new request
- `POST /api/requests/{id}/assign` - Assign request
- `POST /api/requests/{id}/resolve` - Resolve request

### AI
- `POST /api/ai/analyze-tone` - Analyze emotional tone
- `POST /api/ai/generate-response` - Generate AI response
- `POST /api/ai/legal-help` - Legal guidance
- `POST /api/ai/match-food` - Food resource matching
- `POST /api/ai/memory` - Extract conversation memory

### Calls
- `POST /api/call/initiate` - Initiate VAPI call
- `GET /api/call/{id}` - Get call status

### Stats
- `GET /api/stats` - Dashboard statistics

## Configuration

Edit `.env` file to configure:
- `PORT` - Server port (default: 4000)
- `GEMINI_API_KEY` - Google Gemini AI key
- `VAPI_API_KEY` - VAPI voice call key
- `SMTP_USER` - Email for notifications
- `SMTP_PASS` - Email password

## Manual Start

If `./start.sh` doesn't work:

```bash
cd backend
venv/bin/python -m uvicorn main:app --reload --port 4000 --host 0.0.0.0
```

## Test It

```bash
curl http://localhost:4000/api/resources
curl http://localhost:4000/api/requests
```
