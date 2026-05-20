# Event Photo Finder

Full-stack MVP for event photo search using face recognition.

## Backend
- FastAPI + InsightFace (buffalo_s, CPU)
- PostgreSQL + pgvector
- AWS S3 storage

## Frontend
- React + Vite + Tailwind

## Environment
Create env files:
- backend/.env (copy from backend/.env.example)
- frontend/.env (copy from frontend/.env.example)

Make sure PostgreSQL is running and the credentials in backend/.env are correct.

## Database setup
1. Create database matching DB_NAME.
2. Ensure pgvector extension is available.
3. Start the backend once; it creates tables automatically.

## Run (dev)
Backend:
- From repo root: /home/aman/Downloads/grabpic/.venv/bin/python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000

Frontend:
- cd frontend
- npm run dev -- --host 0.0.0.0 --port 5173

## API
POST /register
POST /login
POST /events
GET /events
DELETE /events/{id}
POST /upload-event-photos/{event_id}
POST /find-me/{event_id}
