import cv2
import numpy as np
from insightface.app import FaceAnalysis

_app = None


def get_app():
    global _app
    if _app is None:
        _app = FaceAnalysis(name='buffalo_s')
        _app.prepare(ctx_id=-1)
    return _app


def _resize_for_inference(image: np.ndarray, max_dim: int = 1024):
    h, w = image.shape[:2]
    scale = min(max_dim / max(h, w), 1.0)
    if scale >= 1.0:
        return image, 1.0
    new_w, new_h = int(w * scale), int(h * scale)
    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return resized, scale


def get_embeddings(image_bgr: np.ndarray):
    app = get_app()
    resized, scale = _resize_for_inference(image_bgr)
    faces = app.get(resized)
    results = []
    for face in faces:
        emb = face.embedding
        if emb is None:
            continue
        bbox = face.bbox.astype(int).tolist()
        # Scale back bbox to original image coordinates
        if scale != 1.0:
            bbox = [int(v / scale) for v in bbox]
        results.append({
            'embedding': emb.astype(np.float32),
            'bbox': bbox,
            'score': float(face.det_score) if face.det_score is not None else 0.0,
        })
    return results


def get_single_embedding(image_bgr: np.ndarray):
    faces = get_embeddings(image_bgr)
    if not faces:
        return None
    faces.sort(key=lambda f: f['score'], reverse=True)
    return faces[0]
