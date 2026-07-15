---
type: project
created: 2026-07-12
updated: 2026-07-12
---

# SpeakFlow AI — Project Conventions

## Hackathon
- Event: Build with Gemma: NUTECH Islamabad
- Date: July 15, 2026
- Track: Education AI
- Prize: $1,000 USD
- Team: 4 people
- Demo: Local machine (localhost:3000 frontend + localhost:8000 backend)

## Tech Stack (LOCKED — do not re-debate)
- Frontend: Next.js 14 App Router + TypeScript + Tailwind CSS v3
- Backend: FastAPI + Python 3.11
- AI model: Gemma 4 via Google AI Studio (model id: gemma-4-9b-it)
- Database: SQLite (zero setup, built into Python)
- Charts: Recharts
- Icons: lucide-react

## Key Files
- Blueprint (rebuild doc): d:\[Project]\SpeakFlow\SPEAKFLOW_BLUEPRINT.md
- Design reference: d:\[Project]\SpeakFlow\Dashboard.jpeg
- Flow reference: d:\[Project]\SpeakFlow\Flowdiagram.jfif
- Spec: d:\[Project]\SpeakFlow\SpeakFlow_AI_Project_Specification.md

## Environment Variables
- GEMMA_API_KEY → backend/.env ONLY (never committed, never logged)
- NEXT_PUBLIC_API_URL=http://localhost:8000 → frontend/.env.local

## Architecture
- 5 Gemma agents: same gemma-4-9b-it model, 5 different system prompts
- Agents 1+2+3 run in parallel (asyncio.gather)
- Agent 4 (Practice Generator) waits for 1+2+3 to complete
- Agent 5 (Progress Tracker) runs independently, parallel to Agent 4
- All agents return structured JSON only — no markdown, no prose

## Build Order
1. Backend: FastAPI setup → 5 agent files → orchestrator → DB schema → API routes
2. Frontend: Next.js → Sidebar/Topbar → Dashboard cards (6 cards) → api.ts wiring
3. Polish: Seeded SQLite data → waveform animation → end-to-end test → demo prep

## Dashboard Pages (priority order)
1. /dashboard — main demo screen (build first, most important)
2. /agents — Gemma pipeline visualization (second priority)
3. /sessions — session history (third priority)
4. /students, /practice, /reports, /progress, /settings — if time allows

## Demo Strategy
- Show live transcript with word highlighted orange mid-read
- Show AI Agents at Work panel lighting up in sequence
- Show radial diagnosis score (82/100) + practice sentences
- Fallback: pre-seeded session in DB if live audio fails
