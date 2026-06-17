import os
import boto3
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

def _validate_config():
    aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    aws_s3_bucket = os.getenv('AWS_S3_BUCKET')
    missing = []
    if not aws_access_key_id:
        missing.append('AWS_ACCESS_KEY_ID')
    if not aws_secret_access_key:
        missing.append('AWS_SECRET_ACCESS_KEY')
    if not aws_s3_bucket:
        missing.append('AWS_S3_BUCKET')
    if missing:
        raise ValueError(f"Missing S3 configuration: {', '.join(missing)}")
    return aws_access_key_id, aws_secret_access_key, aws_s3_bucket


def _get_client():
    aws_access_key_id, aws_secret_access_key, _ = _validate_config()
    aws_region = os.getenv('AWS_REGION', 'us-east-1')
    return boto3.client(
        's3',
        region_name=aws_region,
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
    )


def upload_file(file_path: str, key: str) -> str:
    s3 = _get_client()
    aws_s3_bucket = os.getenv('AWS_S3_BUCKET')
    aws_region = os.getenv('AWS_REGION', 'us-east-1')
    s3.upload_file(file_path, aws_s3_bucket, key)
    return f"https://{aws_s3_bucket}.s3.{aws_region}.amazonaws.com/{key}"


def extract_key_from_url(url: str) -> str | None:
    if not url:
        return None
    marker = '.amazonaws.com/'
    if marker in url:
        return url.split(marker, 1)[1]
    return None


def get_presigned_url(key: str, expires_in: int = 3600) -> str:
    s3 = _get_client()
    aws_s3_bucket = os.getenv('AWS_S3_BUCKET')
    return s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': aws_s3_bucket, 'Key': key},
        ExpiresIn=expires_in,
    )
