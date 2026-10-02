import cv2
import numpy as np
from insightface.app import FaceAnalysis

_app = None
_app_selfie = None  # Separate instance tuned for close-up selfie detection

# Minimum detection confidence – faces below this are too noisy to store
MIN_DET_SCORE = 0.5


def get_app():
    global _app
    if _app is None:
        # buffalo_sc: MobileNet backbone — lightweight, fits Render free tier (~100 MB RAM).
        # Accuracy gap vs buffalo_l is recovered via CLAHE preprocessing + TTA on selfies.
        _app = FaceAnalysis(name='buffalo_sc')
        # det_size=(640,640) ensures reliable detection of small/distant faces in event photos
        # ctx_id=-1 uses CPU
        _app.prepare(ctx_id=-1, det_size=(640, 640))
    return _app


def get_app_selfie():
    """Separate app instance with smaller det_size, tuned for close-up selfies.

    At det_size=(320,320) InsightFace is faster and more reliable for faces
    that nearly fill the frame (typical selfie framing).
    """
    global _app_selfie
    if _app_selfie is None:
        _app_selfie = FaceAnalysis(name='buffalo_sc')
        _app_selfie.prepare(ctx_id=-1, det_size=(320, 320))
    return _app_selfie


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


def _apply_clahe(image: np.ndarray) -> np.ndarray:
    """Apply CLAHE (adaptive histogram equalization) in LAB colour space.

    Normalises uneven lighting before face detection/embedding.
    This is especially important for buffalo_sc (MobileNet), which is more
    sensitive to exposure and contrast variation than the ResNet-50 model.
    clipLimit=2.0 and tileGridSize=(8,8) are standard balanced settings.
    """
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    return cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)


def load_image(path: str) -> np.ndarray:
    """Load an image from disk with EXIF orientation and CLAHE correction."""
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError('Invalid image file')
    # Correct EXIF rotation (phone uploads)
    img = _auto_orient(img, path)
    # Normalize lighting — improves buffalo_sc accuracy under varied conditions
    img = _apply_clahe(img)
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


def get_embeddings(image_bgr: np.ndarray, selfie_mode: bool = False):
    """Extract face embeddings from an image.

    Returns a list of dicts with 'embedding' (L2-normalized 512-d),
    'bbox', and 'score' for each detected face that passes the
    confidence threshold.

    Args:
        image_bgr: Input image in BGR format.
        selfie_mode: If True, uses the smaller det_size instance (320×320)
                     which is more accurate for close-up face framing.
    """
    app = get_app_selfie() if selfie_mode else get_app()
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


def get_single_embedding(image_bgr: np.ndarray, selfie_mode: bool = False):
    """Extract the best (highest confidence) face embedding from an image."""
    faces = get_embeddings(image_bgr, selfie_mode=selfie_mode)
    if not faces:
        return None
    faces.sort(key=lambda f: f['score'], reverse=True)
    return faces[0]


def get_single_embedding_tta(image_bgr: np.ndarray):
    """Test-time augmentation: average original + horizontally flipped embedding.

    Averages the embeddings from the original selfie and its mirror image,
    then re-normalizes. This produces a more stable query vector and reduces
    false negatives — particularly useful with the lighter buffalo_sc model.
    Only used for selfie search queries, never for event photo ingestion.
    """
    face1 = get_single_embedding(image_bgr, selfie_mode=True)
    if face1 is None:
        return None

    flipped = cv2.flip(image_bgr, 1)
    face2 = get_single_embedding(flipped, selfie_mode=True)

    if face2 is None:
        return face1  # graceful fallback to single embedding

    avg_emb = face1['embedding'] + face2['embedding']
    norm = np.linalg.norm(avg_emb)
    avg_emb = avg_emb / norm if norm > 0 else avg_emb  # re-normalize to unit length
    return {**face1, 'embedding': avg_emb}
