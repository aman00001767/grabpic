from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
