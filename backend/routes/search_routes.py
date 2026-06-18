import os
import shutil
import uuid
import asyncio
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from ..auth import get_current_user
from .. import db
from ..face_engine import get_single_embedding, load_image
from ..s3 import extract_key_from_url, get_presigned_url

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


def _load_image(path: str):
    return load_image(path)


def _search_faces(emb_list, event_id, threshold):
    """Run the similarity search and return matches with presigned URLs."""
    results = db.fetch_all(
        """
        SELECT photos.id AS photo_id,
               photos.image_url,
               MIN(face_embeddings.embedding <=> %s::vector) AS distance
        FROM face_embeddings
        JOIN photos ON photos.id = face_embeddings.photo_id
        WHERE photos.event_id = %s
        GROUP BY photos.id, photos.image_url
        ORDER BY distance ASC
        LIMIT 200;
        """,
        [emb_list, event_id],
    )

    matches = [r for r in results if r['distance'] <= threshold]
    for match in matches:
        key = extract_key_from_url(match.get('image_url'))
        if key:
            try:
                match['display_url'] = get_presigned_url(key)
            except Exception:
                match['display_url'] = match.get('image_url')
    return matches


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
            raise HTTPException(status_code=400, detail='No face detected in the uploaded image')

        emb = face['embedding'].tolist()
        threshold = float(os.getenv('SIMILARITY_THRESHOLD', '0.6'))
        matches = _search_faces(emb, event_id, threshold)
        return {'matches': matches}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.post('/find-me/share/{token}')
async def find_me_public(
    token: str,
    file: UploadFile = File(...),
):
    """Guest face search using a share token (no auth required)."""
    share = db.fetch_one(
        "SELECT event_id FROM share_tokens WHERE token = %s AND (expires_at IS NULL OR expires_at > NOW())",
        [token],
    )
    if not share:
        raise HTTPException(status_code=404, detail='Invalid or expired share link')

    event_id = share['event_id']

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail='Unsupported file type')

    temp_path = _save_temp(file)
    try:
        img = await asyncio.to_thread(_load_image, temp_path)
        face = await asyncio.to_thread(get_single_embedding, img)
        if not face:
            raise HTTPException(status_code=400, detail='No face detected in the uploaded image')

        emb = face['embedding'].tolist()
        threshold = float(os.getenv('SIMILARITY_THRESHOLD', '0.6'))
        matches = _search_faces(emb, event_id, threshold)
        return {'matches': matches}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
