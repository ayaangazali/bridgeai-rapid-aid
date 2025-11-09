# BridgeAI Advanced Features

## 🧠 Memory Engine
**Endpoint**: `/api/memory/{user_id}`

Maintains persistent memory for each user including:
- **Preferences**: Food choices, shelter preferences, communication style
- **Medical Needs**: Medications, conditions, accessibility requirements
- **Safe Hours**: Best times to contact them
- **Past Experiences**: History of successful/unsuccessful resource connections
- **Successful Resources**: Which locations worked well for them

**Privacy**: Memory is used ONLY to improve future support and is never shared

### Example Usage:
```python
# Update memory
POST /api/memory/john_d
{
  "preferences": {"foodType": "vegetarian"},
  "medicalNeeds": ["insulin"],
  "safeHours": "9am-9pm",
  "experience": "Visited St. Anthony's soup kitchen - very helpful"
}

# Get memory
GET /api/memory/john_d
```

## 🚨 Safety Scoring System
**Endpoint**: `/api/safety-score/{request_id}`

Assigns a risk score from **1-5** based on:
1. **Tone Analysis** (Distressed +2, Anxious +1)
2. **Time of Day** (Night hours +1)
3. **Weather Conditions** (Extreme weather +1)
4. **Inactivity** (No response in 24h +1)
5. **Location Risk** (High-crime areas +1)

**Score Meanings**:
- 1-2: Normal priority
- 3: Elevated concern
- 4-5: **HIGH RISK** - Auto-escalates to urgent, triggers immediate volunteer dispatch

### Auto-Escalation:
When safety score ≥ 4:
- Request marked as "urgent"
- Organization alerted
- Volunteer dispatch triggered
- Follow-up scheduled within 12 hours

## 🤝 Volunteer Dispatch System
**Endpoints**: `/api/volunteer/match`, `/api/volunteer/matches`

### Features:
- **Automatic Matching**: Urgent requests (safety score ≥ 4) trigger nearby volunteer alerts
- **ETA Tracking**: Volunteers provide estimated arrival time
- **Acceptance Tracking**: System monitors who accepts and reassigns if no response
- **Status Updates**: Real-time tracking (pending → accepted → en-route → completed)

### Workflow:
```python
# 1. Create match
POST /api/volunteer/match?request_id=req-123&volunteer_id=vol-456

# 2. Volunteer accepts
POST /api/volunteer/match/0/accept
{
  "eta": "15 minutes"
}

# 3. Track all matches
GET /api/volunteer/matches
```

## 📊 Need Heatmaps
**Endpoint**: `/api/heatmap`

### Anonymous Data Logging:
Tracks patterns across the city to identify:
- **High-Need Areas**: Neighborhoods with frequent requests
- **Resource Gaps**: Areas lacking shelters or food banks
- **Weather Spikes**: Increased requests during extreme weather
- **Time Patterns**: Peak hours for different types of help

### Data Used For:
- Proactive outreach missions
- Resource allocation recommendations
- Partner organization coordination
- Grant applications and funding

**Privacy**: All data is fully anonymous - no personal information logged

## 📞 Follow-Up Call Agent
**Endpoints**: `/api/follow-ups`, `/api/follow-ups/{request_id}/complete`

### Automatic Follow-Up:
- Scheduled **24-48 hours** after support provided
- Checks on wellbeing
- Updates user memory and safety score
- **Escalates if**:
  - User doesn't respond
  - User reports feeling unsafe
  - User needs additional help

### Call Script:
1. "Hi, this is BridgeAI. We helped you find [resource] a couple days ago. Just checking in - how did it go?"
2. Update memory with their feedback
3. Ask if they need anything else
4. Recalculate safety score based on response

### Escalation Triggers:
- No answer after 3 attempts → Safety score increased to 5
- User reports "still struggling" → New request auto-created
- User mentions danger → Immediate urgent escalation

## 🔄 Integration Example

Complete workflow for a new request:

```python
# 1. User submits request
POST /api/requests
{
  "category": "Food",
  "description": "Haven't eaten in 2 days",
  "location": {...},
  "name": "Maria"
}

# System automatically:
# - Detects tone: "Distressed"
# - Calculates safety score: 4 (tone +2, time +1, inactivity +1)
# - Auto-escalates to "urgent"
# - Logs to heatmap
# - Updates user memory
# - Triggers volunteer dispatch

# 2. Volunteer accepts
POST /api/volunteer/match/0/accept
{"eta": "20 minutes"}

# 3. Request resolved
POST /api/requests/req-123/resolve

# System automatically:
# - Schedules follow-up call for 24 hours later
# - Marks followUpScheduled: true

# 4. Follow-up call made (24h later)
POST /api/follow-ups/req-123/complete
{
  "outcome": "User doing well, food bank was helpful",
  "user_safe": true
}

# System automatically:
# - Updates memory with successful resource
# - Reduces safety score
# - Logs positive outcome
```

## 📈 Dashboard Metrics

Organizations can track:
- Average safety scores over time
- Follow-up success rate
- Volunteer response times
- Heatmap patterns
- Memory utilization effectiveness

## 🔐 Privacy & Ethics

All advanced features follow strict privacy guidelines:
- Memory used ONLY to improve support
- Heatmap data is fully anonymous
- User consent implied through service use
- Data never shared with third parties
- Users can request memory deletion anytime

---

**Built with care for those who need it most** 💙
