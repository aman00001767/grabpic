import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.db import init_db
from backend.routes.auth_routes import router as auth_router
from backend.routes.events_routes import router as events_router
from backend.routes.upload_routes import router as upload_router
from backend.routes.search_routes import router as search_router
from backend.routes.share_routes import router as share_router


@asynccontextmanager
async def lifespan(application):
    init_db()
    yield


app = FastAPI(title='GrabPic API', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router)
app.include_router(events_router)
app.include_router(upload_router)
app.include_router(search_router)
app.include_router(share_router)

# ---------- Serve built frontend in production (Docker) ----------
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

if os.path.isdir(STATIC_DIR):
    # Serve JS/CSS/assets at /assets/...
    app.mount('/assets', StaticFiles(directory=os.path.join(STATIC_DIR, 'assets')), name='assets')

    # SPA catch-all: any non-API route returns index.html
    @app.get('/{full_path:path}')
    async def spa_fallback(full_path: str):
        file_path = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, 'index.html'))
