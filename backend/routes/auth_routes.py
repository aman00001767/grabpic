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


class GoogleAuthInput(BaseModel):
    credential: str   # Google ID token from GSI


class ForgotPasswordInput(BaseModel):
    email: EmailStr


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
    if not user or not user['hashed_password'] or not verify_password(payload.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    token = create_token(user['id'], user['email'])
    return {'token': token, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}}


@router.post('/auth/google')
async def google_auth(payload: GoogleAuthInput):
    """Verify a Google ID token and sign in / register the user."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        import os

        GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=500,
                detail='Google OAuth not configured — set GOOGLE_CLIENT_ID in .env',
            )

        id_info = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f'Invalid Google token: {str(e)}')

    email = id_info['email']
    name = id_info.get('name', email.split('@')[0])

    # Upsert: find or create the user (OAuth users have empty hashed_password)
    user = db.fetch_one('SELECT id, name, email FROM users WHERE email = %s', [email])
    if not user:
        user = db.execute(
            'INSERT INTO users (name, email, hashed_password) VALUES (%s, %s, %s) RETURNING id, name, email',
            [name, email, ''],
            returning=True,
        )

    token = create_token(user['id'], user['email'])
    return {'token': token, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}}


@router.post('/auth/forgot-password')
async def forgot_password(payload: ForgotPasswordInput):
    """
    Initiate a password reset flow.
    Always returns 200 to prevent email enumeration.
    Wire an email provider (SendGrid / SES / Resend) to actually send the link.
    """
    user = db.fetch_one('SELECT id FROM users WHERE email = %s', [payload.email])
    if user:
        # TODO: generate a signed reset token, store it, send reset email
        pass
    return {'message': 'If an account with that email exists, a reset link has been sent.'}
