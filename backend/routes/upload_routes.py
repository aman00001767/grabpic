import os
import shutil
import uuid
import asyncio
import logging
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from ..auth import get_current_user
from .. import db
from ..s3 import upload_file
from ..face_engine import get_embeddings, load_image

router = APIRouter()
logger = logging.getLogger(__name__)

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


@router.post('/upload-event-photos/{event_id}')
async def upload_event_photos(
    event_id: int,
    files: list[UploadFile] = File(...),
    user=Depends(get_current_user),
):
    event = db.fetch_one('SELECT id FROM events WHERE id = %s AND created_by = %s', [event_id, user['id']])
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')

    if not files:
        raise HTTPException(status_code=400, detail='No files uploaded')

    uploaded = []
    for file in files:
        if file.content_type not in ALLOWED_TYPES:
            continue

        temp_path = _save_temp(file)
        filename = os.path.basename(file.filename or temp_path)
        s3_key = f"events/{event_id}/{uuid.uuid4().hex}_{filename}"

        try:
            image_url = await asyncio.to_thread(upload_file, temp_path, s3_key)
        except Exception as exc:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise HTTPException(status_code=500, detail=str(exc)) from exc

        photo = db.execute(
            'INSERT INTO photos (event_id, image_url) VALUES (%s, %s) RETURNING id, image_url',
            [event_id, image_url],
            returning=True,
        )

        face_count = 0
        try:
            img = await asyncio.to_thread(_load_image, temp_path)
            faces = await asyncio.to_thread(get_embeddings, img)
            for face in faces:
                emb = face['embedding'].tolist()
                db.execute(
                    'INSERT INTO face_embeddings (photo_id, embedding) VALUES (%s, %s)',
                    [photo['id'], emb],
                )
                face_count += 1
        except Exception as exc:
            # Non-blocking: log warning but don't fail the upload
            logger.warning('Face processing failed for photo %s: %s', photo['id'], exc)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        uploaded.append({
            'photo_id': photo['id'],
            'image_url': photo['image_url'],
            'face_count': face_count,
        })

    return {'uploaded': uploaded}
