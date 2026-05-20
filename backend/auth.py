import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from . import db

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

JWT_SECRET = os.getenv('JWT_SECRET', 'dev_secret')
JWT_ALG = 'HS256'
JWT_EXPIRE_HOURS = int(os.getenv('JWT_EXPIRE_HOURS', '24'))

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
security = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_token(user_id: int, email: str) -> str:
    payload = {
        'sub': str(user_id),
        'email': email,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = int(payload.get('sub'))
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail='Invalid token')

    user = db.fetch_one('SELECT id, name, email FROM users WHERE id = %s', [user_id])
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    return user
