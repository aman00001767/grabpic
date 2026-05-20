from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from .. import db
from ..auth import hash_password, verify_password, create_token

router = APIRouter()


class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str


@router.post('/register')
async def register(payload: RegisterInput):
    existing = db.fetch_one('SELECT id FROM users WHERE email = %s', [payload.email])
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')

    user = db.execute(
        'INSERT INTO users (name, email, hashed_password) VALUES (%s, %s, %s) RETURNING id, name, email',
        [payload.name, payload.email, hash_password(payload.password)],
        returning=True,
    )
    token = create_token(user['id'], user['email'])
    return {'token': token, 'user': user}


@router.post('/login')
async def login(payload: LoginInput):
    user = db.fetch_one('SELECT id, name, email, hashed_password FROM users WHERE email = %s', [payload.email])
    if not user or not verify_password(payload.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    token = create_token(user['id'], user['email'])
    return {'token': token, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}}
