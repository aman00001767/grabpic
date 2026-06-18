<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_S3-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" />
</p>

# 📸 GrabPic — AI Event Photo Finder

GrabPic is a full-stack web application that lets event organizers upload photos and attendees **instantly find every photo they appear in** using AI-powered face recognition.

Upload event photos → Share a QR code → Guests take a selfie → AI finds their photos.

## ✨ Features

- **AI Face Recognition** — Powered by [InsightFace](https://github.com/deepinsight/insightface) (ArcFace/buffalo_l, ResNet-50) with 512-dim L2-normalized embeddings for state-of-the-art accuracy
- **Selfie or Upload** — Guests can use their device camera to take a live selfie or upload an existing photo
- **QR Code Sharing** — Event creators generate a scannable QR code that links guests directly to the search page (no login required)
- **Smart Matching** — Cosine similarity search using pgvector with configurable thresholds and match confidence percentages
- **S3 Storage** — Photos stored securely on AWS S3 with presigned URL delivery
- **Download Proxy** — CORS-free photo downloads via a backend proxy endpoint
- **EXIF Orientation** — Handles mobile-uploaded photos with rotated EXIF metadata
- **Responsive UI** — Glassmorphism dark theme with smooth animations, lightbox viewer, and drag-and-drop uploads
- **Dockerized** — Single-command deployment with multi-stage Docker build

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│                  Frontend (React + Vite)          │
│  Landing Page · Dashboard · Event Detail · Guest  │
│  Camera Capture · Photo Grid · Lightbox · QR Modal │
└──────────────────────┬───────────────────────────┘
                       │ REST API
┌──────────────────────▼───────────────────────────┐
│              Backend (FastAPI + Uvicorn)           │
│  Auth (JWT) · Events · Upload · Face Search · Share│
├───────────────┬────────────────┬──────────────────┤
│  PostgreSQL   │  InsightFace   │     AWS S3       │
│  + pgvector   │  buffalo_l     │  Photo Storage   │
│  (embeddings) │  (CPU inference)│  (presigned URLs)│
└───────────────┴────────────────┴──────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 15+ with [pgvector](https://github.com/pgvector/pgvector) extension
- AWS S3 bucket + IAM credentials

### 1. Clone and configure

```bash
git clone https://github.com/aman00001767/grabpic.git
cd grabpic

# Create backend environment file
cp backend/.env.example backend/.env
# Edit with your database, JWT, and AWS credentials
nano backend/.env
```

### 2. Backend setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Start the API server (auto-creates database tables)
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🐳 Docker Deployment

Deploy everything with a single command:

```bash
# Build and start (app + PostgreSQL with pgvector)
docker compose up -d --build

# Run face embedding migration (if you have existing photos)
docker compose exec app python -m backend.reprocess_embeddings
```

The app is served at [http://localhost:8000](http://localhost:8000) — both API and frontend from a single port.

## ⚙️ Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `postgres` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | — |
| `JWT_SECRET` | Secret key for JWT tokens | — |
| `JWT_EXPIRE_HOURS` | Token expiration time | `24` |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | — |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | — |
| `AWS_REGION` | S3 bucket region | `us-east-1` |
| `AWS_S3_BUCKET` | S3 bucket name | — |
| `SIMILARITY_THRESHOLD` | Cosine distance threshold (lower = stricter) | `0.6` |

Generate a JWT secret: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Create a new account |
| `POST` | `/login` | Get JWT token |

### Events
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/events` | ✅ | Create an event |
| `GET` | `/events` | ✅ | List your events |
| `GET` | `/events/{id}` | ✅ | Get event details |
| `GET` | `/events/{id}/photos` | ✅ | List event photos |
| `DELETE` | `/events/{id}` | ✅ | Delete an event |

### Photos
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/upload-event-photos/{event_id}` | ✅ | Upload photos (multipart) |
| `GET` | `/photos/{photo_id}/download` | — | Download a photo (proxy) |

### Face Search
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/find-me/{event_id}` | ✅ | Search by selfie (authenticated) |
| `POST` | `/find-me/share/{token}` | — | Search by selfie (guest via share link) |

### Sharing
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/events/{event_id}/share` | ✅ | Generate a share token |
| `GET` | `/share/{token}` | — | Validate share token & get event info |

## 🧠 Face Recognition Pipeline

1. **Upload** — Photos are uploaded to S3, then processed by InsightFace
2. **Detection** — SCRFD detector finds faces at 640×640 resolution (score ≥ 0.5)
3. **Embedding** — ArcFace (ResNet-50) extracts 512-dim L2-normalized embeddings
4. **Storage** — Embeddings stored in PostgreSQL via pgvector
5. **Search** — Selfie embedding is compared using cosine distance (`<=>` operator)
6. **Matching** — Photos within the similarity threshold are returned, ranked by confidence

## 📁 Project Structure

```
grabpic/
├── backend/
│   ├── app.py              # FastAPI application + SPA serving
│   ├── auth.py             # JWT authentication
│   ├── db.py               # PostgreSQL + pgvector connection
│   ├── face_engine.py      # InsightFace model + embedding extraction
│   ├── s3.py               # AWS S3 upload + presigned URLs
│   ├── reprocess_embeddings.py  # Migration script for model upgrades
│   ├── requirements.txt
│   ├── .env.example
│   └── routes/
│       ├── auth_routes.py
│       ├── events_routes.py
│       ├── upload_routes.py
│       ├── search_routes.py
│       └── share_routes.py
├── frontend/
│   ├── src/
│   │   ├── pages/          # Landing, Login, Dashboard, EventDetail, GuestSearch
│   │   ├── components/     # Navbar, PhotoGrid, Lightbox, UploadZone, CameraCapture, SelfieInput, Toast
│   │   └── services/       # API client (axios)
│   ├── package.json
│   └── vite.config.js
├── Dockerfile              # Multi-stage build (Node + Python)
├── docker-compose.yml      # App + PostgreSQL with pgvector
└── .dockerignore
```

## 📄 License

MIT
