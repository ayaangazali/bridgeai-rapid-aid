# BridgeAI API Documentation

## 🔑 API Keys Required

Add these to `backend/.env`:

```env
# Google Gemini (AI Features)
GEMINI_API_KEY=your-key-here
# Get from: https://makersuite.google.com/app/apikey

# VAPI.ai (Voice Calling)
VAPI_API_KEY=your-key-here
VAPI_PHONE_NUMBER=+1234567890
VAPI_ASSISTANT_ID=your-assistant-id
# Get from: https://vapi.ai/dashboard

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=BridgeAI <noreply@bridgeai.com>
```

**Note:** All features work in **MOCK MODE** without API keys (for testing)!

---

## 🤖 AI Endpoints

### POST `/api/ai/analyze-tone`
Analyze emotional tone from text (Calm, Anxious, Distressed)

**Request:**
```json
{
  "text": "I really need help finding food tonight, I'm worried"
}
```

**Response:**
```json
{
  "tone": "Anxious",
  "confidence": 0.89,
  "suggestions": [
    "Reassure them",
    "Provide immediate options"
  ]
}
```

---

### POST `/api/ai/legal-help`
Get legal assistance and resources

**Request:**
```json
{
  "question": "How do I replace my lost ID?",
  "context": {
    "location": "San Francisco",
    "hasDocuments": false
  }
}
```

**Response:**
```json
{
  "answer": "To replace a lost ID in California, visit your local DMV...",
  "resources": [
    {
      "name": "SF DMV Downtown",
      "phone": "(415) 555-1234",
      "type": "DMV"
    }
  ],
  "nextSteps": [
    "Gather proof of identity documents",
    "Visit DMV with appointment"
  ]
}
```

---

### POST `/api/ai/match-food`
Match surplus food to nearby food banks/shelters

**Request:**
```json
{
  "foodDescription": "50 lbs fresh vegetables, 20 loaves of bread",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194,
    "address": "SoMa, SF"
  }
}
```

**Response:**
```json
{
  "matches": [
    {
      "resource": {
        "id": "r1",
        "name": "Mission Food Bank",
        "location": {...}
      },
      "score": 0.95,
      "reason": "Close proximity, high capacity, accepts fresh produce"
    }
  ]
}
```

---

### POST `/api/ai/memory`
Generate conversation memory/summary

**Request:**
```json
{
  "conversation": [
    "I need food assistance",
    "I'm vegetarian and available after 6pm"
  ],
  "previousMemory": ["First time caller"]
}
```

**Response:**
```json
{
  "summary": "User requesting vegetarian food assistance, available evenings",
  "keyPoints": [
    "Vegetarian dietary restriction",
    "Available after 6pm",
    "Food assistance needed"
  ]
}
```

---

### POST `/api/ai/generate-response`
Generate empathetic AI response based on tone

**Request:**
```json
{
  "message": "I'm scared and don't know what to do",
  "tone": "Distressed",
  "context": {
    "category": "Shelter",
    "location": "SF"
  }
}
```

**Response:**
```json
{
  "response": "I understand you're feeling scared right now, and I'm here to help you immediately. Let's find you a safe place to stay tonight. The nearest shelter has beds available."
}
```

---

## 📞 Voice Calling Endpoints (VAPI)

### POST `/api/call/initiate`
Start an AI phone call

**Request:**
```json
{
  "phoneNumber": "+14155551234",
  "tone": "Anxious",
  "greeting": "Hi, this is BridgeAI. I'm calling to help you with your food assistance request.",
  "metadata": {
    "requestId": "req-123",
    "category": "Food"
  }
}
```

**Response:**
```json
{
  "callId": "call-abc123",
  "status": "initiated",
  "toNumber": "+14155551234",
  "timestamp": "2025-11-08T10:30:00Z"
}
```

---

### GET `/api/call/:callId`
Get call status and transcription

**Response:**
```json
{
  "callId": "call-abc123",
  "status": "completed",
  "duration": 120,
  "transcription": [
    {
      "role": "assistant",
      "text": "Hello, how can I help you?"
    },
    {
      "role": "user",
      "text": "I need food assistance"
    }
  ],
  "recording": "https://recordings.vapi.ai/abc123.mp3"
}
```

---

### POST `/api/call/:callId/end`
End an ongoing call

**Response:**
```json
{
  "callId": "call-abc123",
  "status": "ended"
}
```

---

## 📧 Email Notification Endpoints

### POST `/api/notifications/send`
Send custom email notification

**Request:**
```json
{
  "to": "volunteer@example.com",
  "subject": "New Request Alert",
  "html": "<h1>New Request</h1><p>Details here...</p>",
  "text": "New Request - Details here..."
}
```

**Response:**
```json
{
  "messageId": "msg-abc123",
  "accepted": ["volunteer@example.com"]
}
```

**Auto-sent emails:**
- New request → All volunteers
- Request assigned → Assigned volunteer
- Request received → User (if email provided)
- Request resolved → All stakeholders

---

## 📋 Request Endpoints (Enhanced)

### GET `/api/requests`
Get all requests

**Response:**
```json
{
  "requests": [
    {
      "id": "req-1",
      "category": "Food",
      "description": "Need dinner",
      "tone": "Calm",
      "status": "open",
      "priority": "normal",
      "location": {...},
      "name": "Maria",
      "phone": "+14155551234",
      "email": "user@example.com",
      "conversation": [...],
      "memory": [...],
      "timestamp": "2025-11-08T10:00:00Z"
    }
  ]
}
```

---

### POST `/api/requests`
Create new request (with AI tone analysis)

**Request:**
```json
{
  "category": "Food",
  "description": "I desperately need food for my kids tonight",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194,
    "address": "SoMa, SF"
  },
  "name": "Anonymous",
  "phone": "+14155551234",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "id": "req-1699234567890",
  "category": "Food",
  "description": "I desperately need food for my kids tonight",
  "tone": "Distressed",
  "priority": "high",
  "status": "open",
  "location": {...},
  "timestamp": "2025-11-08T10:30:00Z"
}
```

**Auto-triggered:**
- AI tone analysis if tone not provided
- Email notification to volunteers
- Socket.IO event: `new_request`
- Priority scoring (high/medium/normal)

---

### POST `/api/requests/:id/assign`
Assign request to volunteer

**Request:**
```json
{
  "volunteerEmail": "volunteer@example.com",
  "volunteerName": "John Doe"
}
```

**Response:**
```json
{
  "id": "req-123",
  "status": "assigned",
  "assignedTo": "John Doe",
  "assignedAt": "2025-11-08T11:00:00Z"
}
```

**Auto-triggered:**
- Email notification to volunteer
- Socket.IO event: `request_updated`

---

### POST `/api/requests/:id/resolve`
Mark request as resolved

**Request:**
```json
{
  "notifyEmails": [
    "volunteer@example.com",
    "coordinator@example.com"
  ]
}
```

**Response:**
```json
{
  "id": "req-123",
  "status": "resolved",
  "resolvedAt": "2025-11-08T12:00:00Z"
}
```

**Auto-triggered:**
- Email notification to specified addresses
- Socket.IO event: `request_updated`

---

### GET `/api/resources`
Get all resources (food banks, shelters)

**Response:**
```json
{
  "resources": [
    {
      "id": "res-1",
      "name": "Mission Food Bank",
      "type": "Food Bank",
      "location": {
        "lat": 37.76,
        "lng": -122.42,
        "address": "16th Street, Mission"
      }
    }
  ]
}
```

---

## 🔌 WebSocket Events (Socket.IO)

Connect to: `http://localhost:4000`

**Events emitted by server:**

- `new_request` - When new request is created
- `request_updated` - When request is assigned/resolved

**Example (client-side):**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

socket.on('new_request', (request) => {
  console.log('New request:', request);
  // Update UI, show notification, etc.
});

socket.on('request_updated', (request) => {
  console.log('Request updated:', request);
  // Update request in list
});
```

---

## 🧪 Testing Without API Keys

All features work in **mock mode** when API keys are not configured:

- **Gemini AI** → Returns realistic mock responses
- **VAPI** → Returns mock call IDs and transcriptions
- **Email** → Logs to console instead of sending

This lets you develop and test the full app without signing up for services!

---

## 🚀 Quick Start

1. **Copy environment file:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Add your API keys** (optional for testing):
   - Gemini: https://makersuite.google.com/app/apikey
   - VAPI: https://vapi.ai/dashboard
   - Gmail SMTP: Use app password if 2FA enabled

3. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Test endpoints:**
   ```bash
   # Test tone analysis
   curl -X POST http://localhost:4000/api/ai/analyze-tone \
     -H "Content-Type: application/json" \
     -d '{"text": "I really need help urgently"}'
   
   # Test legal help
   curl -X POST http://localhost:4000/api/ai/legal-help \
     -H "Content-Type: application/json" \
     -d '{"question": "How do I get a replacement ID?"}'
   ```

---

## 📊 Frontend Integration Examples

See `FRONTEND_INTEGRATION.md` for React component examples and button wiring.

---

## 🛠️ Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (missing required fields)
- `404` - Not found
- `500` - Server error

---

## 💡 Next Steps

1. Add your API keys to `.env`
2. Test endpoints with curl or Postman
3. Wire frontend buttons to new endpoints
4. Add authentication for volunteers
5. Set up MongoDB for data persistence
