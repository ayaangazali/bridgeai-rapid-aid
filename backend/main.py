"""
BridgeAI FastAPI Backend
Complete API for AI-Powered Rapid Support Network
"""

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv
import google.generativeai as genai
import httpx
import math

load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="BridgeAI API",
    description="AI-Powered Support Network for Homeless Assistance",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-pro')
    print("✅ Gemini AI configured")
else:
    gemini_model = None
    print("⚠️ Gemini AI not configured")

# VAPI Configuration
VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_BASE_URL = "https://api.vapi.ai"
print(f"✅ VAPI configured: {bool(VAPI_API_KEY)}")

# ==================== DATA MODELS ====================

class Location(BaseModel):
    lat: float
    lng: float
    address: str

class Request(BaseModel):
    id: Optional[str] = None
    category: str
    description: str
    tone: str = "Calm"
    status: str = "open"
    location: Location
    name: Optional[str] = "Anonymous"
    conversation: List[str] = []
    memory: List[str] = []
    timestamp: Optional[datetime] = None

class Resource(BaseModel):
    id: str
    type: str
    name: str
    location: Location
    phone: Optional[str] = None
    hours: Optional[str] = None
    services: List[str] = []

class AIRequest(BaseModel):
    text: Optional[str] = None
    message: Optional[str] = None
    tone: Optional[str] = "Calm"
    context: Optional[Dict[str, Any]] = None

class ResourceSearchRequest(BaseModel):
    location: Location
    type: Optional[str] = None
    limit: int = 5

class CallRequest(BaseModel):
    phoneNumber: str
    tone: Optional[str] = "Calm"

# ==================== IN-MEMORY DATA STORAGE ====================

requests_db: List[Dict] = [
    {
        "id": "req-1",
        "category": "Food",
        "description": "Need food for my family tonight",
        "tone": "Anxious",
        "status": "open",
        "location": {
            "lat": 37.7749,
            "lng": -122.4194,
            "address": "123 Market St, San Francisco, CA"
        },
        "name": "John D.",
        "conversation": ["I need help finding food"],
        "memory": ["Has children", "First time requesting"],
        "timestamp": datetime.now().isoformat()
    }
]

resources_db: List[Dict] = [
    {
        "id": "res-1",
        "type": "food",
        "name": "Mission Food Bank",
        "location": {
            "lat": 37.7599,
            "lng": -122.4148,
            "address": "1234 Mission St, San Francisco, CA 94103"
        },
        "phone": "415-555-1234",
        "hours": "Mon-Fri 9am-5pm",
        "services": ["Hot meals", "Groceries", "Food pantry"]
    },
    {
        "id": "res-2",
        "type": "food",
        "name": "St. Anthony Foundation",
        "location": {
            "lat": 37.7833,
            "lng": -122.4167,
            "address": "150 Golden Gate Ave, San Francisco, CA 94102"
        },
        "phone": "415-241-2600",
        "hours": "Daily 9am-4pm",
        "services": ["Free dining room", "Clothing", "Medical clinic"]
    },
    {
        "id": "res-3",
        "type": "food",
        "name": "Glide Memorial Church",
        "location": {
            "lat": 37.7844,
            "lng": -122.4121,
            "address": "330 Ellis St, San Francisco, CA 94102"
        },
        "phone": "415-674-6000",
        "hours": "Daily 7am-9pm",
        "services": ["Free meals", "Healthcare", "Housing assistance"]
    },
    {
        "id": "res-4",
        "type": "shelter",
        "name": "Navigation Center SoMa",
        "location": {
            "lat": 37.7749,
            "lng": -122.4194,
            "address": "16th St & Mission, San Francisco, CA 94103"
        },
        "phone": "415-557-5153",
        "hours": "24/7",
        "services": ["Emergency shelter", "Case management", "Pet-friendly"]
    },
    {
        "id": "res-5",
        "type": "shelter",
        "name": "Next Door Shelter",
        "location": {
            "lat": 37.7694,
            "lng": -122.4862,
            "address": "1001 Polk St, San Francisco, CA 94109"
        },
        "phone": "415-668-5955",
        "hours": "24/7",
        "services": ["Family shelter", "Meals", "Childcare"]
    },
    {
        "id": "res-6",
        "type": "legal",
        "name": "Coalition on Homelessness",
        "location": {
            "lat": 37.7847,
            "lng": -122.4075,
            "address": "468 Turk St, San Francisco, CA 94102"
        },
        "phone": "415-346-3740",
        "hours": "Mon-Fri 9am-5pm",
        "services": ["Legal aid", "Housing advocacy", "Benefits assistance"]
    },
    {
        "id": "res-7",
        "type": "medical",
        "name": "SF Free Clinic",
        "location": {
            "lat": 37.7699,
            "lng": -122.4525,
            "address": "4900 California St, San Francisco, CA 94118"
        },
        "phone": "415-487-5632",
        "hours": "Tue-Thu 6pm-9pm",
        "services": ["Primary care", "Mental health", "Dental"]
    }
]

# ==================== HELPER FUNCTIONS ====================

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates using Haversine formula (in miles)"""
    R = 3959  # Earth's radius in miles
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

async def analyze_tone_with_ai(text: str) -> str:
    """Analyze emotional tone using Gemini AI"""
    if not gemini_model:
        return "Calm"
    
    try:
        prompt = f'Analyze the emotional tone and classify as "Calm", "Anxious", or "Distressed". Respond with only one word: {text}'
        response = gemini_model.generate_content(prompt)
        tone_text = response.text.strip()
        
        if "Distressed" in tone_text:
            return "Distressed"
        elif "Anxious" in tone_text:
            return "Anxious"
        else:
            return "Calm"
    except Exception as e:
        print(f"Gemini tone analysis error: {e}")
        return "Calm"

async def generate_ai_response(message: str, tone: str, context: Dict = None) -> str:
    """Generate empathetic AI response using Gemini"""
    if not gemini_model:
        return "I understand you need help. Let me find resources for you."
    
    try:
        context_str = f" Context: {context}" if context else ""
        prompt = f'''You are a compassionate AI assistant helping homeless individuals. 
The user's emotional tone is {tone}. {context_str}
Respond empathetically and helpfully to: "{message}"
Keep response under 100 words and be supportive.'''
        
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini response generation error: {e}")
        return "I'm here to help you. What do you need assistance with?"

# ==================== API ENDPOINTS ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "BridgeAI Backend",
        "version": "1.0.0",
        "ai_services": {
            "gemini": bool(gemini_model),
            "vapi": bool(VAPI_API_KEY)
        }
    }

# ==================== AI ENDPOINTS ====================

@app.post("/api/ai/analyze-tone")
async def analyze_tone(request: AIRequest):
    """Analyze emotional tone of text"""
    text = request.text or request.message or ""
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    tone = await analyze_tone_with_ai(text)
    
    return {
        "tone": tone,
        "confidence": 0.9,
        "mock": not bool(gemini_model)
    }

@app.post("/api/ai/generate-response")
async def generate_response(request: AIRequest):
    """Generate AI response"""
    message = request.message or request.text or ""
    tone = request.tone or "Calm"
    context = request.context or {}
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    response = await generate_ai_response(message, tone, context)
    
    return {"response": response}

@app.post("/api/ai/legal-help")
async def legal_help(request: AIRequest):
    """Provide legal guidance"""
    question = request.message or request.text or ""
    
    if not gemini_model:
        return {"response": "Legal aid services are available at Coalition on Homelessness: 415-346-3740"}
    
    try:
        prompt = f"As a legal assistant helping homeless individuals, provide brief guidance on: {question}. Keep response under 150 words."
        response = gemini_model.generate_content(prompt)
        return {"response": response.text.strip()}
    except Exception as e:
        print(f"Legal help error: {e}")
        return {"response": "For legal assistance, please contact Coalition on Homelessness: 415-346-3740"}

@app.post("/api/ai/match-food")
async def match_food(request: Dict):
    """Match food resources with needs"""
    description = request.get("foodDescription", "")
    location = request.get("location", {})
    
    # Find nearby food resources
    search_result = await search_resources(
        ResourceSearchRequest(
            location=Location(**location),
            type="food",
            limit=3
        )
    )
    
    return {
        "recommendations": search_result["resources"],
        "message": f"Found {len(search_result['resources'])} food resources nearby"
    }

@app.post("/api/ai/memory")
async def generate_memory(request: Dict):
    """Extract key points from conversation"""
    conversation = request.get("conversation", [])
    
    if not gemini_model:
        return {"memory": ["First interaction", "Needs assistance"]}
    
    try:
        prompt = f"Extract 2-3 key points from this conversation: {conversation}. Return as a brief list."
        response = gemini_model.generate_content(prompt)
        memory_points = response.text.strip().split("\n")
        return {"memory": [point.strip("- ").strip() for point in memory_points if point.strip()]}
    except Exception as e:
        print(f"Memory generation error: {e}")
        return {"memory": ["Needs assistance"]}

# ==================== RESOURCE ENDPOINTS ====================

@app.get("/api/resources")
async def get_resources():
    """Get all resources"""
    return {"resources": resources_db}

@app.post("/api/resources/search")
async def search_resources(request: ResourceSearchRequest):
    """Search resources by location and type"""
    location = request.location
    resource_type = request.type
    limit = request.limit
    
    # Filter by type if specified
    filtered = resources_db if not resource_type else [r for r in resources_db if r["type"] == resource_type]
    
    # Calculate distances
    with_distances = []
    for resource in filtered:
        distance = calculate_distance(
            location.lat,
            location.lng,
            resource["location"]["lat"],
            resource["location"]["lng"]
        )
        resource_copy = resource.copy()
        resource_copy["distance"] = round(distance, 2)
        with_distances.append(resource_copy)
    
    # Sort by distance and limit
    sorted_resources = sorted(with_distances, key=lambda x: x["distance"])[:limit]
    
    return {"resources": sorted_resources}

# ==================== REQUEST ENDPOINTS ====================

@app.get("/api/requests")
async def get_requests():
    """Get all requests"""
    return {"requests": requests_db}

@app.post("/api/requests")
async def create_request(request: Request):
    """Create new help request"""
    
    # Auto-detect tone if not provided
    if request.description and gemini_model:
        tone = await analyze_tone_with_ai(request.description)
        request.tone = tone
    
    # Generate ID and timestamp
    request.id = f"req-{int(datetime.now().timestamp() * 1000)}"
    request.timestamp = datetime.now()
    
    # Convert to dict and add to database
    request_dict = request.model_dump()
    request_dict["timestamp"] = request.timestamp.isoformat()
    requests_db.insert(0, request_dict)
    
    return request_dict

@app.post("/api/requests/{request_id}/assign")
async def assign_request(request_id: str):
    """Assign request to volunteer"""
    request = next((r for r in requests_db if r["id"] == request_id), None)
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    request["status"] = "assigned"
    return request

@app.post("/api/requests/{request_id}/resolve")
async def resolve_request(request_id: str):
    """Mark request as resolved"""
    request = next((r for r in requests_db if r["id"] == request_id), None)
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    request["status"] = "resolved"
    return request

# ==================== VAPI CALL ENDPOINTS ====================

# VAPI Assistant System Prompt - Empathetic Support Agent
VAPI_SYSTEM_PROMPT = """You are a compassionate and empathetic AI assistant for BridgeAI, a service that helps people in need find immediate assistance.

Your role is to:
1. **Be warm, caring, and non-judgmental** - Many people you call are in vulnerable situations
2. **Understand their immediate needs** - Ask what kind of help they need: shelter, food, or other resources
3. **Get their location** - Politely ask where they are currently located (city, neighborhood, or cross streets)
4. **Provide specific, actionable recommendations** based on their location:
   - For FOOD: Recommend nearby food banks, soup kitchens, community meals, or food pantries
   - For SHELTER: Suggest emergency shelters, warming centers, or safe places they can go
   - For RESOURCES: Direct them to government assistance, health services, legal aid, or social services
5. **Give clear directions** - Provide addresses, phone numbers, and simple walking/transit directions
6. **Offer hope and support** - Remind them that help is available and they're not alone
7. **Keep the conversation brief** but thorough - They may have limited phone battery or minutes

Remember:
- Use simple, clear language
- Be patient if they seem confused or upset
- Never make promises you can't keep
- Focus on immediate, practical help
- End the call by confirming they know where to go next

Start by warmly introducing yourself: "Hi, this is BridgeAI calling to help connect you with resources. Is now a good time to talk for a few minutes?"
"""

@app.post("/api/call/initiate")
async def initiate_call(request: CallRequest):
    """Initiate VAPI voice call - ALWAYS calls +16693609914"""
    # HARDCODED: Always call this number regardless of input
    HARDCODED_NUMBER = "+16693609914"
    VAPI_PHONE_NUMBER = os.getenv("VAPI_PHONE_NUMBER", "+19592510645")
    
    if not VAPI_API_KEY:
        print(f"⚠️ MOCK MODE: Would call {HARDCODED_NUMBER}")
        return {
            "callId": "mock-call-id",
            "status": "initiated",
            "mock": True,
            "phoneNumber": HARDCODED_NUMBER
        }
    
    try:
        print(f"🔥 INITIATING REAL VAPI CALL TO: {HARDCODED_NUMBER}")
        # VAPI Phone Number ID (retrieved from VAPI API)
        VAPI_PHONE_NUMBER_ID = "41a48de3-d5d9-47f1-adb1-08bffa234b26"
        print(f"📞 Using VAPI phone ID: {VAPI_PHONE_NUMBER_ID}")
        
        async with httpx.AsyncClient() as client:
            # CORRECT VAPI format according to their API
            response = await client.post(
                f"{VAPI_BASE_URL}/call/phone",
                headers={
                    "Authorization": f"Bearer {VAPI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "assistantId": os.getenv("VAPI_ASSISTANT_ID"),
                    "phoneNumberId": VAPI_PHONE_NUMBER_ID,  # ID of your VAPI phone
                    "customer": {
                        "number": HARDCODED_NUMBER  # Number to call
                    },
                    "assistantOverrides": {
                        "firstMessage": "Hi, this is BridgeAI calling to help connect you with resources. Is now a good time to talk for a few minutes?",
                        "model": {
                            "provider": "openai",
                            "model": "gpt-4",
                            "systemPrompt": VAPI_SYSTEM_PROMPT
                        }
                    }
                },
                timeout=30.0
            )
            result = response.json()
            print(f"✅ VAPI Response: {result}")
            
            # VAPI returns 'id' not 'callId', normalize the response
            if 'id' in result and 'callId' not in result:
                result['callId'] = result['id']
            
            result['phoneNumber'] = HARDCODED_NUMBER
            return result
    except Exception as e:
        print(f"❌ VAPI call error: {e}")
        raise HTTPException(status_code=500, detail=f"Call initiation failed: {str(e)}")

@app.get("/api/call/{call_id}")
async def get_call_status(call_id: str):
    """Get call status"""
    if not VAPI_API_KEY:
        return {"callId": call_id, "status": "completed", "mock": True}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{VAPI_BASE_URL}/call/{call_id}",
                headers={"Authorization": f"Bearer {VAPI_API_KEY}"}
            )
            return response.json()
    except Exception as e:
        print(f"VAPI status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get call status")

# ==================== NOTIFICATION ENDPOINTS ====================

@app.post("/api/notifications/send")
async def send_notification(request: Dict):
    """Send email notification (mock for now)"""
    return {
        "sent": True,
        "mock": True,
        "message": "Notification would be sent via SMTP"
    }

# ==================== STATS ENDPOINTS ====================

@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics"""
    return {
        "total": len(requests_db),
        "open": len([r for r in requests_db if r["status"] == "open"]),
        "assigned": len([r for r in requests_db if r["status"] == "assigned"]),
        "resolved": len([r for r in requests_db if r["status"] == "resolved"]),
        "resources": len(resources_db)
    }

# Application startup
print(f"\n🚀 BridgeAI FastAPI Backend")
print(f"📊 Initial data: {len(requests_db)} requests, {len(resources_db)} resources")
print(f"📖 API docs available at: http://localhost:4000/docs\n")
