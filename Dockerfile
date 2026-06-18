# ============================================================
# Stage 1: Build the React frontend
# ============================================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# ============================================================
# Stage 2: Python backend + serve built frontend
# ============================================================
FROM python:3.12-slim

# System dependencies for OpenCV, psycopg2, and ONNX Runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend into backend/static for serving
COPY --from=frontend-build /app/frontend/dist ./backend/static

# Create temp_uploads directory
RUN mkdir -p ./backend/temp_uploads

# Pre-download the InsightFace buffalo_l model so first request isn't slow
RUN python -c "from insightface.app import FaceAnalysis; app = FaceAnalysis(name='buffalo_l'); print('Model downloaded')"

# Expose the API port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
