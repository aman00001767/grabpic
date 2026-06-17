import uuid
from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_user
from .. import db

router = APIRouter()


@router.post('/events/{event_id}/share')
async def create_share_token(event_id: int, user=Depends(get_current_user)):
    """Create a shareable link token for an event."""
    event = db.fetch_one(
        'SELECT id FROM events WHERE id = %s AND created_by = %s',
        [event_id, user['id']],
    )
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')

    # Reuse existing token if available
    existing = db.fetch_one(
        "SELECT token FROM share_tokens WHERE event_id = %s AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC LIMIT 1",
        [event_id],
    )
    if existing:
        return {'token': existing['token'], 'event_id': event_id}

    token = uuid.uuid4().hex
    db.execute(
        'INSERT INTO share_tokens (event_id, token) VALUES (%s, %s)',
        [event_id, token],
    )
    return {'token': token, 'event_id': event_id}


@router.get('/share/{token}')
async def get_shared_event(token: str):
    """Validate share token and return event info (no auth required)."""
    share = db.fetch_one(
        "SELECT event_id FROM share_tokens WHERE token = %s AND (expires_at IS NULL OR expires_at > NOW())",
        [token],
    )
    if not share:
        raise HTTPException(status_code=404, detail='Invalid or expired share link')

    event = db.fetch_one(
        'SELECT id, title, description, created_at FROM events WHERE id = %s',
        [share['event_id']],
    )
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')

    return event
