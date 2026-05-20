from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..auth import get_current_user
from .. import db

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
    events = db.fetch_all('SELECT * FROM events WHERE created_by = %s ORDER BY created_at DESC', [user['id']])
    return events


@router.delete('/events/{event_id}')
async def delete_event(event_id: int, user=Depends(get_current_user)):
    event = db.fetch_one('SELECT id FROM events WHERE id = %s AND created_by = %s', [event_id, user['id']])
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')
    db.execute('DELETE FROM events WHERE id = %s', [event_id])
    return {'ok': True}
