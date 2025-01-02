import boto3
from django.conf import settings
from botocore.exceptions import ClientError
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class AWSS3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME

    def upload_file(self, file_obj, key: str, content_type: Optional[str] = None) -> Dict[str, Any]:
        """Upload a file to S3"""
        try:
            extra_args = {
                'ACL': 'public-read'
            }
            if content_type:
                extra_args['ContentType'] = content_type

            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                key,
                ExtraArgs=extra_args
            )

            url = f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
            return {
                'success': True,
                'url': url,
                'key': key
            }
        except ClientError as e:
            logger.error(f"Error uploading file to S3: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def delete_file(self, key: str) -> Dict[str, Any]:
        """Delete a file from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return {
                'success': True
            }
        except ClientError as e:
            logger.error(f"Error deleting file from S3: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def generate_presigned_url(self, key: str, expiration: int = 3600) -> Dict[str, Any]:
        """Generate a presigned URL for a file"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key
                },
                ExpiresIn=expiration
            )
            return {
                'success': True,
                'url': url,
                'expires_in': expiration
            }
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            } 