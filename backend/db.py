import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '5432'))
DB_NAME = os.getenv('DB_NAME', 'postgres')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'user123')

_pool = None


def _get_pool():
    global _pool
    if _pool is None:
        _pool = ThreadedConnectionPool(
            minconn=2,
            maxconn=10,
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
        )
    return _pool


def get_conn(register=True):
    pool = _get_pool()
    conn = pool.getconn()
    if register:
        register_vector(conn)
    return conn


def put_conn(conn):
    pool = _get_pool()
    pool.putconn(conn)


def init_db():
    conn = get_conn(register=False)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute('CREATE EXTENSION IF NOT EXISTS vector')
    register_vector(conn)

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS photos (
            id SERIAL PRIMARY KEY,
            event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
            image_url TEXT NOT NULL,
            uploaded_at TIMESTAMP DEFAULT NOW()
        );
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS face_embeddings (
            id SERIAL PRIMARY KEY,
            photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
            embedding vector(512)
        );
        """
    )

    # ivfflat index needs at least some rows to build, so use IF NOT EXISTS
    cur.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_face_embeddings_vector
        ON face_embeddings USING ivfflat (embedding vector_cosine_ops);
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS share_tokens (
            id SERIAL PRIMARY KEY,
            event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
            token TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            expires_at TIMESTAMP
        );
        """
    )

    cur.close()
    put_conn(conn)


def fetch_one(query, params=None):
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query, params or [])
        row = cur.fetchone()
        cur.close()
        return row
    finally:
        put_conn(conn)


def fetch_all(query, params=None):
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query, params or [])
        rows = cur.fetchall()
        cur.close()
        return rows
    finally:
        put_conn(conn)


def execute(query, params=None, returning=False):
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query, params or [])
        row = cur.fetchone() if returning else None
        conn.commit()
        cur.close()
        return row
    except Exception:
        conn.rollback()
        raise
    finally:
        put_conn(conn)
