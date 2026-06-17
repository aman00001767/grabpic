import cv2
import numpy as np
from insightface.app import FaceAnalysis

_app = None

# Minimum detection confidence – faces below this are too noisy to store
MIN_DET_SCORE = 0.5


def get_app():
    global _app
    if _app is None:
        # buffalo_l: ResNet-50 backbone, highest accuracy model in InsightFace
        _app = FaceAnalysis(name='buffalo_l')
        # det_size=(640,640) ensures reliable detection of small/distant faces
        # ctx_id=-1 uses CPU
        _app.prepare(ctx_id=-1, det_size=(640, 640))
    return _app


def _auto_orient(image: np.ndarray, path: str | None = None) -> np.ndarray:
    """Apply EXIF orientation correction.

    cv2.imread ignores EXIF rotation tags, so phone photos often appear
    rotated.  We re-read with IMREAD_UNCHANGED + ROTATE flags via the
    EXIF-aware flag introduced in OpenCV 4.x.
    """
    if path is not None:
        # Re-read with EXIF auto-orientation (OpenCV 4.x+)
        corrected = cv2.imread(path, cv2.IMREAD_COLOR | cv2.IMREAD_IGNORE_ORIENTATION)
        if corrected is None:
            corrected = cv2.imread(path, cv2.IMREAD_COLOR)
        if corrected is not None:
            return corrected
    return image


def load_image(path: str) -> np.ndarray:
    """Load an image from disk with EXIF orientation correction."""
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError('Invalid image file')
    # Apply EXIF orientation
    img = _auto_orient(img, path)
    return img


def _resize_for_inference(image: np.ndarray, max_dim: int = 1920):
    """Downsample large images to keep inference time reasonable.

    max_dim raised from 1024→1920 to preserve more facial detail.
    """
    h, w = image.shape[:2]
    scale = min(max_dim / max(h, w), 1.0)
    if scale >= 1.0:
        return image, 1.0
    new_w, new_h = int(w * scale), int(h * scale)
    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return resized, scale


def get_embeddings(image_bgr: np.ndarray):
    """Extract face embeddings from an image.

    Returns a list of dicts with 'embedding' (L2-normalized 512-d),
    'bbox', and 'score' for each detected face that passes the
    confidence threshold.
    """
    app = get_app()
    resized, scale = _resize_for_inference(image_bgr)
    faces = app.get(resized)
    results = []
    for face in faces:
        # Filter out low-confidence detections (partial/blurry faces)
        score = float(face.det_score) if face.det_score is not None else 0.0
        if score < MIN_DET_SCORE:
            continue

        # Use normed_embedding (L2-normalized) – REQUIRED for cosine distance.
        # face.embedding is the raw output and is NOT unit-normalized,
        # which makes cosine distance meaningless.
        emb = face.normed_embedding
        if emb is None:
            # Fallback: manually normalize if normed_embedding unavailable
            raw = face.embedding
            if raw is None:
                continue
            norm = np.linalg.norm(raw)
            emb = raw / norm if norm > 0 else raw

        bbox = face.bbox.astype(int).tolist()
        # Scale back bbox to original image coordinates
        if scale != 1.0:
            bbox = [int(v / scale) for v in bbox]
        results.append({
            'embedding': emb.astype(np.float32),
            'bbox': bbox,
            'score': score,
        })
    return results


def get_single_embedding(image_bgr: np.ndarray):
    """Extract the best (highest confidence) face embedding from an image."""
    faces = get_embeddings(image_bgr)
    if not faces:
        return None
    faces.sort(key=lambda f: f['score'], reverse=True)
    return faces[0]
