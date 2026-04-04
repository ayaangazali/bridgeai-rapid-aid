# BridgeAI - Rapid Support Network

AI-Powered platform connecting homeless individuals with essential resources and services in San Francisco.

## 🚀 Quick Start

### Backend (FastAPI)
```bash
cd backend
./start.sh
```
Backend runs on: `http://localhost:4000`

### Frontend (React + Vite)
```bash
npm i
npm run dev
```
Frontend runs on: `http://localhost:8080`

## ✨ Features

- 🗺️ **Interactive Map** - Leaflet-based map showing resources and requests
- 💬 **AI Chatbot** - Gemini-powered assistance for homeless individuals
- 🎤 **Voice Input** - Speech recognition for easier form filling
- 📍 **GPS Location** - Automatic location detection
- 📊 **Dashboard** - Volunteer/organization request management
- 🔔 **Real-time Updates** - Auto-assigning and resolving requests
- ☎️ **Voice Calls** - VAPI integration for voice assistance

## 🛠️ Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- Leaflet.js for maps
- React Router

**Backend:**
- FastAPI (Python)
- Google Generative AI (Gemini)
- VAPI for voice calls
- Uvicorn server

## 📁 Project Structure

```
├── backend/              # FastAPI backend
│   ├── main.py          # Main FastAPI application
│   ├── start.sh         # Simple start script
│   ├── .env             # Environment variables
│   └── requirements.txt # Python dependencies
├── src/
│   ├── pages/           # React pages
│   ├── components/      # Reusable components
│   ├── types/           # TypeScript types
│   └── data/            # Seed data
└── package.json         # Node.js dependencies
```

## 🔑 Environment Variables

Edit `backend/.env`:
```
GEMINI_API_KEY=your_gemini_key
VAPI_API_KEY=your_vapi_key
SMTP_USER=your_email
SMTP_PASS=your_password
```

## 📖 API Documentation

Once backend is running, visit: `http://localhost:4000/docs`

## 🎯 Usage

1. **Start Backend**: `cd backend && ./start.sh`
2. **Start Frontend**: `npm run dev`
3. **Open Browser**: `http://localhost:8080`
4. **Test Dashboard**: View requests and resources on map
5. **Test Help Page**: Try the AI chatbot with voice input

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a6246341-ecc8-4b04-b462-f17d2a3e6b77) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Backend (local development)

This repository includes a minimal Express backend used by the Dashboard during development.

Start the backend:

```bash
cd backend
npm install
npm run dev
```

- The backend listens on http://localhost:4000 and provides these endpoints used by the frontend:

- GET /api/requests — returns { requests: [...] }
- POST /api/requests — create a new request (body: request fields)
- POST /api/requests/:id/assign — mark request assigned
- POST /api/requests/:id/resolve — mark request resolved
- GET /api/resources — returns { resources: [...] }

Next steps you might want to add:

- Persist data with MongoDB (already included as a dependency in `backend/package.json`)
- Add Socket.IO client in the frontend to receive realtime updates
- Add authentication for volunteers and organizations.

