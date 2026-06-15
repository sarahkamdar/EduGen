import os
from pathlib import Path
import boto3
from botocore.exceptions import ClientError


def get_s3_client():
    # boto3 will pick up credentials from environment / IAM role
    region = os.getenv("AWS_REGION")
    if region:
        return boto3.client('s3', region_name=region)
    return boto3.client('s3')


def upload_file_to_s3(file_path: str, bucket: str, key: str) -> str:
    s3 = get_s3_client()
    s3.upload_file(str(file_path), bucket, key)
    return f"s3://{bucket}/{key}"


def generate_presigned_url(bucket: str, key: str, expires_in: int = 3600) -> str | None:
    s3 = get_s3_client()
    try:
        url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket, 'Key': key}, ExpiresIn=expires_in)
        return url
    except ClientError:
        return None
