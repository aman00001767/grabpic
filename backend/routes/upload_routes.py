import os
import shutil
import uuid
import asyncio
import logging
import re
import tempfile
from typing import Optional, List
import requests
import gdown
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from ..auth import get_current_user
from .. import db
from ..s3 import upload_file
from ..face_engine import get_embeddings, load_image

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
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


async def _process_and_save_photo(event_id: int, file_path: str, original_filename: str) -> dict:
    """Uploads file to S3, saves DB photo record, computes & stores face embeddings."""
    safe_name = os.path.basename(original_filename or file_path)
    s3_key = f"events/{event_id}/{uuid.uuid4().hex}_{safe_name}"

    try:
        image_url = await asyncio.to_thread(upload_file, file_path, s3_key)
    except Exception as exc:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {exc}") from exc

    photo = db.execute(
        'INSERT INTO photos (event_id, image_url) VALUES (%s, %s) RETURNING id, image_url',
        [event_id, image_url],
        returning=True,
    )

    face_count = 0
    try:
        img = await asyncio.to_thread(_load_image, file_path)
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
        if os.path.exists(file_path):
            os.remove(file_path)

    return {
        'photo_id': photo['id'],
        'image_url': photo['image_url'],
        'face_count': face_count,
    }


def _extract_drive_id(url: str) -> tuple[Optional[str], str]:
    """Extracts ID and determines if link is folder or file."""
    clean = url.strip()
    folder_match = re.search(r'/folders/([a-zA-Z0-9_-]+)', clean)
    if folder_match:
        return folder_match.group(1), 'folder'

    file_match = re.search(r'/file/d/([a-zA-Z0-9_-]+)', clean)
    if file_match:
        return file_match.group(1), 'file'

    id_param_match = re.search(r'[?&]id=([a-zA-Z0-9_-]+)', clean)
    if id_param_match:
        return id_param_match.group(1), 'file'

    if re.match(r'^[a-zA-Z0-9_-]{20,}$', clean):
        return clean, 'unknown'

    return None, 'unknown'


class DriveUploadRequest(BaseModel):
    drive_url: Optional[str] = None
    file_ids: Optional[List[str]] = None
    access_token: Optional[str] = None


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
        item = await _process_and_save_photo(event_id, temp_path, filename)
        uploaded.append(item)

    return {'uploaded': uploaded}


@router.post('/upload-from-drive/{event_id}')
async def upload_from_drive(
    event_id: int,
    req: DriveUploadRequest,
    user=Depends(get_current_user),
):
    event = db.fetch_one('SELECT id FROM events WHERE id = %s AND created_by = %s', [event_id, user['id']])
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')

    _ensure_temp_dir()
    uploaded = []

    # Case 1: Google Picker with OAuth Access Token
    if req.access_token and req.file_ids:
        headers = {'Authorization': f'Bearer {req.access_token}'}
        for fid in req.file_ids:
            try:
                # Fetch metadata
                meta_res = requests.get(
                    f'https://www.googleapis.com/drive/v3/files/{fid}?fields=id,name,mimeType',
                    headers=headers,
                    timeout=15,
                )
                if meta_res.status_code != 200:
                    continue
                meta = meta_res.json()
                name = meta.get('name', f"{fid}.jpg")
                ext = os.path.splitext(name)[1].lower() or '.jpg'
                if ext not in ALLOWED_EXTENSIONS and 'image' not in meta.get('mimeType', ''):
                    continue

                # Download binary
                dl_res = requests.get(
                    f'https://www.googleapis.com/drive/v3/files/{fid}?alt=media',
                    headers=headers,
                    stream=True,
                    timeout=60,
                )
                if dl_res.status_code != 200:
                    continue

                temp_path = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex}_{name}")
                with open(temp_path, 'wb') as f:
                    for chunk in dl_res.iter_content(chunk_size=16384):
                        f.write(chunk)

                item = await _process_and_save_photo(event_id, temp_path, name)
                uploaded.append(item)
            except Exception as e:
                logger.warning('Failed to import file %s from Drive via token: %s', fid, e)

    # Case 2: Public or Shareable Google Drive URL / Folder link
    elif req.drive_url and req.drive_url.strip():
        raw_items = [u.strip() for u in re.split(r'[\r\n,]+', req.drive_url) if u.strip()]

        for item_url in raw_items:
            drive_id, link_type = _extract_drive_id(item_url)
            if not drive_id and not item_url.startswith('http'):
                continue

            # If it's a folder link
            if link_type == 'folder':
                folder_temp = tempfile.mkdtemp(dir=TEMP_DIR)
                try:
                    logger.info('Downloading Google Drive folder: %s', drive_id or item_url)
                    await asyncio.to_thread(
                        gdown.download_folder,
                        id=drive_id,
                        output=folder_temp,
                        quiet=True,
                        use_cookies=False,
                    )

                    # Walk directory for images
                    for root, _, files in os.walk(folder_temp):
                        for f in files:
                            ext = os.path.splitext(f)[1].lower()
                            if ext in ALLOWED_EXTENSIONS:
                                local_img_path = os.path.join(root, f)
                                # Make a safe copy to process
                                copied_path = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex}_{f}")
                                shutil.copyfile(local_img_path, copied_path)
                                item = await _process_and_save_photo(event_id, copied_path, f)
                                uploaded.append(item)
                except Exception as exc:
                    logger.error('Failed to download folder from Google Drive: %s', exc)
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "Could not download folder from Google Drive. "
                            "Please ensure the link's General Access is set to 'Anyone with the link' (Viewer)."
                        ),
                    ) from exc
                finally:
                    shutil.rmtree(folder_temp, ignore_errors=True)

            else:
                # Single file link or direct ID
                temp_path = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex}.jpg")
                try:
                    target_url = item_url if item_url.startswith('http') else None
                    target_id = drive_id if not target_url else None
                    out = await asyncio.to_thread(
                        gdown.download,
                        url=target_url,
                        id=target_id,
                        output=temp_path,
                        quiet=True,
                        fuzzy=True,
                        use_cookies=False,
                    )
                    if out and os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
                        item = await _process_and_save_photo(event_id, temp_path, "drive_photo.jpg")
                        uploaded.append(item)
                    else:
                        if os.path.exists(temp_path):
                            os.remove(temp_path)
                except Exception as exc:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                    logger.error('Failed to download single file from Google Drive: %s', exc)
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "Could not download photo from Google Drive. "
                            "Please check the link and ensure sharing is set to 'Anyone with the link'."
                        ),
                    ) from exc

    else:
        raise HTTPException(status_code=400, detail='Please provide a Google Drive link or select files.')

    if not uploaded:
        raise HTTPException(
            status_code=400,
            detail='No supported image files (.jpg, .jpeg, .png, .webp) were found at the provided Google Drive link.',
        )

    return {
        'uploaded': uploaded,
        'count': len(uploaded),
        'message': f"Successfully imported {len(uploaded)} photo{'s' if len(uploaded) != 1 else ''} from Google Drive!",
    }
