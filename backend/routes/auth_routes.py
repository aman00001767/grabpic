import os
import secrets
import urllib.parse
import requests
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
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
    credential: str   # Google ID token from OAuth redirect or GSI


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


def _get_or_create_oauth_user(email: str, name: str):
    """Find an existing user by email or create a new OAuth user."""
    user = db.fetch_one('SELECT id, name, email FROM users WHERE email = %s', [email])
    if not user:
        user = db.execute(
            'INSERT INTO users (name, email, hashed_password) VALUES (%s, %s, %s) RETURNING id, name, email',
            [name, email, ''],
            returning=True,
        )
    return user


@router.get('/auth/google/login')
async def google_login(request: Request, redirect_to: str = None):
    """
    Initiate Google OAuth 2.0 full-page redirect.
    Immune to ad blockers, popup blockers, and third-party cookie restrictions.
    """
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail='Google OAuth not configured — set GOOGLE_CLIENT_ID in .env',
        )

    # Determine frontend URL
    frontend_url = os.getenv('FRONTEND_URL', '').rstrip('/')
    if not frontend_url:
        referer = request.headers.get('referer')
        if referer:
            parsed = urllib.parse.urlparse(referer)
            frontend_url = f"{parsed.scheme}://{parsed.netloc}"
        else:
            frontend_url = 'http://localhost:5173'

    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')

    if GOOGLE_CLIENT_SECRET:
        # Standard Authorization Code Flow
        host = request.headers.get('x-forwarded-host') or request.headers.get('host') or 'localhost:8000'
        proto = request.headers.get('x-forwarded-proto') or request.url.scheme
        callback_uri = f"{proto}://{host}/auth/google/callback"

        params = {
            'client_id': GOOGLE_CLIENT_ID,
            'redirect_uri': callback_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'online',
            'prompt': 'select_account',
            'state': redirect_to or frontend_url,
        }
        url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
        return RedirectResponse(url)
    else:
        # Direct OIDC ID Token flow (no client secret needed on backend)
        nonce = secrets.token_urlsafe(16)
        frontend_login = f"{frontend_url}/login"
        params = {
            'client_id': GOOGLE_CLIENT_ID,
            'redirect_uri': frontend_login,
            'response_type': 'id_token',
            'scope': 'openid email profile',
            'nonce': nonce,
            'prompt': 'select_account',
        }
        url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
        return RedirectResponse(url)


@router.get('/auth/google/callback')
async def google_callback(request: Request, code: str = None, error: str = None, state: str = None):
    """
    Handle Google OAuth callback (server-side code exchange).
    Communicates server-to-server with Google, completely bypassing ad blockers.
    """
    frontend_url = (state or os.getenv('FRONTEND_URL', 'http://localhost:5173')).rstrip('/')

    if error or not code:
        err_msg = urllib.parse.quote(error or 'Google sign-in was cancelled')
        return RedirectResponse(f"{frontend_url}/login?error={err_msg}")

    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')

    host = request.headers.get('x-forwarded-host') or request.headers.get('host') or 'localhost:8000'
    proto = request.headers.get('x-forwarded-proto') or request.url.scheme
    callback_uri = f"{proto}://{host}/auth/google/callback"

    try:
        token_resp = requests.post(
            'https://oauth2.googleapis.com/token',
            data={
                'client_id': GOOGLE_CLIENT_ID,
                'client_secret': GOOGLE_CLIENT_SECRET,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': callback_uri,
            },
            timeout=10,
        )
        if token_resp.status_code != 200:
            err_detail = token_resp.json().get('error_description', 'Failed to exchange authorization code')
            return RedirectResponse(f"{frontend_url}/login?error={urllib.parse.quote(err_detail)}")

        tokens = token_resp.json()
        access_token = tokens.get('access_token')

        userinfo_resp = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f"Bearer {access_token}"},
            timeout=10,
        )
        if userinfo_resp.status_code != 200:
            return RedirectResponse(f"{frontend_url}/login?error=Failed+to+fetch+user+profile+from+Google")

        user_info = userinfo_resp.json()
        email = user_info['email']
        name = user_info.get('name', email.split('@')[0])

        user = _get_or_create_oauth_user(email, name)
        jwt_token = create_token(user['id'], user['email'])

        query = urllib.parse.urlencode({
            'token': jwt_token,
            'name': user['name'],
            'email': user['email'],
        })
        return RedirectResponse(f"{frontend_url}/login?{query}")
    except Exception as exc:
        return RedirectResponse(f"{frontend_url}/login?error={urllib.parse.quote(str(exc))}")


@router.post('/auth/google')
async def google_auth(payload: GoogleAuthInput):
    """Verify a Google ID token and sign in / register the user."""
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail='Google OAuth not configured — set GOOGLE_CLIENT_ID in .env',
        )

    id_info = None
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        id_info = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ImportError:
        # Fallback to Google's official REST tokeninfo endpoint (zero extra dependencies required)
        try:
            resp = requests.get(
                'https://oauth2.googleapis.com/tokeninfo',
                params={'id_token': payload.credential},
                timeout=10,
            )
            if resp.status_code != 200:
                err_detail = resp.json().get('error_description', 'Invalid token')
                raise HTTPException(status_code=401, detail=f'Invalid Google token: {err_detail}')

            id_info = resp.json()
            # Verify the audience matches our client ID
            if id_info.get('aud') != GOOGLE_CLIENT_ID:
                raise HTTPException(status_code=401, detail='Token client ID mismatch')
        except HTTPException:
            raise
        except Exception as net_err:
            raise HTTPException(status_code=401, detail=f'Token verification failed: {str(net_err)}')
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f'Invalid Google token: {str(e)}')

    email = id_info.get('email')
    if not email:
        raise HTTPException(status_code=400, detail='Email not found in Google profile')
    name = id_info.get('name', email.split('@')[0])

    user = _get_or_create_oauth_user(email, name)
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
