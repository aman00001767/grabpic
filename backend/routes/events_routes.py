from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..auth import get_current_user
from .. import db
from ..s3 import extract_key_from_url, get_presigned_url

router = APIRouter()


class EventCreate(BaseModel):
    title: str
    description: str | None = None


@router.post('/events')
async def create_event(payload: EventCreate, user=Depends(get_current_user)):
    event = db.execute(
        'INSERT INTO events (title, description, created_by) VALUES (%s, %s, %s) RETURNING *',
        [payload.title, payload.description, user['id']],
        returning=True,
    )
    return event


@router.get('/events')
async def list_events(user=Depends(get_current_user)):
    events = db.fetch_all(
        """
        SELECT e.*, COALESCE(pc.cnt, 0) AS photo_count
        FROM events e
        LEFT JOIN (
            SELECT event_id, COUNT(*) AS cnt FROM photos GROUP BY event_id
        ) pc ON pc.event_id = e.id
        WHERE e.created_by = %s
        ORDER BY e.created_at DESC
        """,
        [user['id']],
    )
    return events


@router.get('/events/{event_id}')
async def get_event(event_id: int, user=Depends(get_current_user)):
    event = db.fetch_one(
        """
        SELECT e.*, COALESCE(pc.cnt, 0) AS photo_count
        FROM events e
        LEFT JOIN (
            SELECT event_id, COUNT(*) AS cnt FROM photos GROUP BY event_id
        ) pc ON pc.event_id = e.id
        WHERE e.id = %s AND e.created_by = %s
        """,
        [event_id, user['id']],
    )
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')
    return event


@router.get('/events/{event_id}/photos')
async def list_event_photos(event_id: int, user=Depends(get_current_user)):
    event = db.fetch_one(
        'SELECT id FROM events WHERE id = %s AND created_by = %s',
        [event_id, user['id']],
    )
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')

    photos = db.fetch_all(
        'SELECT id, image_url, uploaded_at FROM photos WHERE event_id = %s ORDER BY uploaded_at DESC',
        [event_id],
    )

    for photo in photos:
        key = extract_key_from_url(photo.get('image_url'))
        if key:
            try:
                photo['display_url'] = get_presigned_url(key)
            except Exception:
                photo['display_url'] = photo.get('image_url')

    return photos


@router.delete('/events/{event_id}')
async def delete_event(event_id: int, user=Depends(get_current_user)):
    event = db.fetch_one('SELECT id FROM events WHERE id = %s AND created_by = %s', [event_id, user['id']])
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')
    db.execute('DELETE FROM events WHERE id = %s', [event_id])
    return {'ok': True}


@router.get('/photos/{photo_id}/download')
async def download_photo(photo_id: int):
    """Proxy-download a photo from S3, bypassing CORS restrictions."""
    import requests as http_requests
    from fastapi.responses import StreamingResponse
    import io

    photo = db.fetch_one('SELECT id, image_url FROM photos WHERE id = %s', [photo_id])
    if not photo:
        raise HTTPException(status_code=404, detail='Photo not found')

    key = extract_key_from_url(photo.get('image_url'))
    if not key:
        raise HTTPException(status_code=404, detail='Photo URL invalid')

    try:
        url = get_presigned_url(key, expires_in=300)
    except Exception:
        raise HTTPException(status_code=500, detail='Failed to generate download URL')

    resp = http_requests.get(url, timeout=30, stream=True)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail='Failed to fetch from storage')

    content_type = resp.headers.get('Content-Type', 'image/jpeg')
    ext = '.jpg'
    if 'png' in content_type:
        ext = '.png'
    elif 'webp' in content_type:
        ext = '.webp'

    return StreamingResponse(
        io.BytesIO(resp.content),
        media_type=content_type,
        headers={
            'Content-Disposition': f'attachment; filename="grabpic-photo-{photo_id}{ext}"',
        },
    )
