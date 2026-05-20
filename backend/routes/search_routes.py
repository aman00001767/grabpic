import os
import shutil
import uuid
import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from ..auth import get_current_user
from .. import db
from ..face_engine import get_single_embedding

router = APIRouter()

ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
TEMP_DIR = os.path.join(os.path.dirname(__file__), '..', 'temp_uploads')


def _ensure_temp_dir():
    os.makedirs(TEMP_DIR, exist_ok=True)


def _save_temp(file: UploadFile) -> str:
    _ensure_temp_dir()
    ext = os.path.splitext(file.filename or '')[1] or '.jpg'
    temp_name = f"{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join(TEMP_DIR, temp_name)
    with open(temp_path, 'wb') as f:
        shutil.copyfileobj(file.file, f)
    return temp_path


def _load_image(path: str) -> np.ndarray:
    img = cv2.imread(path)
    if img is None:
        raise ValueError('Invalid image file')
    return img


@router.post('/find-me/{event_id}')
async def find_me(
    event_id: int,
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    event = db.fetch_one('SELECT id FROM events WHERE id = %s AND created_by = %s', [event_id, user['id']])
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail='Unsupported file type')

    temp_path = _save_temp(file)
    try:
        img = await asyncio.to_thread(_load_image, temp_path)
        face = await asyncio.to_thread(get_single_embedding, img)
        if not face:
            raise HTTPException(status_code=400, detail='No face detected')

        emb = face['embedding'].tolist()
        threshold = float(os.getenv('SIMILARITY_THRESHOLD', '0.45'))

        results = db.fetch_all(
            """
            SELECT photos.image_url,
                   face_embeddings.embedding <=> %s::vector AS distance
            FROM face_embeddings
            JOIN photos ON photos.id = face_embeddings.photo_id
            WHERE photos.event_id = %s
            ORDER BY distance ASC
            LIMIT 20;
            """,
            [emb, event_id],
        )

        matches = [r for r in results if r['distance'] <= threshold]
        return {'matches': matches}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
