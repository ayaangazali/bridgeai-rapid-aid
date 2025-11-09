# Quick Start Commands

## Run Backend Only

```bash
cd backend && ./start.sh
```

That's it! Backend will start on http://localhost:4000

---

## Alternative (if start.sh doesn't work)

```bash
cd backend && venv/bin/python -m uvicorn main:app --reload --port 4000 --host 0.0.0.0
```

---

## Run in Background

```bash
cd backend && nohup ./start.sh > backend.log 2>&1 &
```

---

## Stop Backend

```bash
pkill -f "uvicorn.*main:app"
```

---

## Check Backend Status

```bash
curl http://localhost:4000/
```

Should return:
```json
{
  "status": "online",
  "service": "BridgeAI Backend",
  "version": "1.0.0",
  "ai_services": {
    "gemini": true,
    "vapi": true
  }
}
```
