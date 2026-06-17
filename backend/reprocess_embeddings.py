"""Re-process all existing photos to regenerate face embeddings.

Run this script ONCE after upgrading from buffalo_s to buffalo_l to replace
old (incompatible) embeddings with new normed_embedding vectors.

Usage:
    cd /home/aman/Downloads/grabpic
    python -m backend.reprocess_embeddings
"""

import os
import sys
import tempfile
import logging
import requests

# Ensure package imports work when running as __main__
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import init_db, get_conn, put_conn, fetch_all, execute
from backend.face_engine import get_embeddings, load_image
from backend.s3 import extract_key_from_url, get_presigned_url

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)


def _download_image(url: str) -> str | None:
    """Download an image from S3 using a presigned URL. Returns temp path or None."""
    # Generate a presigned URL so we can access private S3 objects
    key = extract_key_from_url(url)
    if key:
        try:
            download_url = get_presigned_url(key, expires_in=300)
        except Exception as exc:
            logger.warning('Failed to generate presigned URL for %s: %s', url, exc)
            return None
    else:
        download_url = url

    try:
        resp = requests.get(download_url, timeout=30)
        resp.raise_for_status()
    except Exception as exc:
        logger.warning('Failed to download %s: %s', url, exc)
        return None

    suffix = '.jpg'
    if 'png' in resp.headers.get('content-type', ''):
        suffix = '.png'
    elif 'webp' in resp.headers.get('content-type', ''):
        suffix = '.webp'

    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, 'wb') as f:
        f.write(resp.content)
    return path


def reprocess():
    """Delete all old embeddings and regenerate them with the new model."""
    init_db()

    photos = fetch_all('SELECT id, image_url FROM photos ORDER BY id')
    total = len(photos)
    logger.info('Found %d photos to re-process', total)

    if total == 0:
        logger.info('Nothing to do.')
        return

    # Clear all old embeddings
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute('DELETE FROM face_embeddings')
        conn.commit()
        cur.close()
        logger.info('Cleared all old face_embeddings')
    finally:
        put_conn(conn)

    success = 0
    total_faces = 0

    for i, photo in enumerate(photos, 1):
        photo_id = photo['id']
        image_url = photo['image_url']
        logger.info('[%d/%d] Processing photo %d ...', i, total, photo_id)

        temp_path = _download_image(image_url)
        if temp_path is None:
            logger.warning('  Skipped (download failed)')
            continue

        try:
            img = load_image(temp_path)
            faces = get_embeddings(img)
            for face in faces:
                emb = face['embedding'].tolist()
                execute(
                    'INSERT INTO face_embeddings (photo_id, embedding) VALUES (%s, %s)',
                    [photo_id, emb],
                )
                total_faces += 1
            logger.info('  Found %d face(s)', len(faces))
            success += 1
        except Exception as exc:
            logger.error('  Failed: %s', exc)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    logger.info('Done! Processed %d/%d photos, stored %d face embeddings.', success, total, total_faces)


if __name__ == '__main__':
    reprocess()
