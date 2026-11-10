"""AWS S3 Service module using Boto3.

Interacts with Amazon S3 using the AWS standard credential provider chain:
- In AWS ECS Fargate: automatically uses the ECS Task IAM Role.
- In local development: uses AWS CLI profile or local environment variables.
Never hardcodes AWS credentials and never exposes S3 bucket or files to public access.
"""

import logging
from functools import lru_cache
from typing import Any, Dict, Optional, Tuple

import boto3
from botocore.exceptions import ClientError, EndpointConnectionError, NoCredentialsError

from app.core.config import Settings, get_settings

logger = logging.getLogger("dariai_picture_mirror.s3")


class S3Service:
    """Service for interacting with private AWS S3 bucket for DaRI AI Picture Mirror."""

    def __init__(
        self,
        bucket_name: Optional[str] = None,
        region_name: Optional[str] = None,
        client: Optional[Any] = None,
    ) -> None:
        self.settings: Settings = get_settings()
        self.bucket_name: str = bucket_name or self.settings.S3_BUCKET_NAME
        self.region_name: str = region_name or self.settings.AWS_REGION

        if client is not None:
            self._client = client
        else:
            # Let boto3 resolve credentials via the standard AWS credential chain
            # (ECS Task Role -> ~/.aws/credentials -> environment variables)
            self._client = boto3.client("s3", region_name=self.region_name)

    @property
    def client(self) -> Any:
        return self._client

    def check_bucket_accessibility(self) -> Tuple[bool, Optional[str]]:
        """Verify that the configured S3 bucket exists and is accessible.

        Uses head_bucket to perform a read-only metadata probe.
        Does NOT upload, overwrite, modify, or delete any objects.
        Keeps the bucket completely private.
        """
        try:
            self.client.head_bucket(Bucket=self.bucket_name)
            return True, "S3 bucket accessible"
        except NoCredentialsError:
            logger.warning("S3 probe failed: No AWS credentials found in environment or ECS task role")
            return False, "AWS credentials not configured"
        except EndpointConnectionError:
            logger.warning("S3 probe failed: Could not establish connection to S3 endpoint in %s", self.region_name)
            return False, "S3 endpoint unreachable"
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code", "Unknown")
            logger.warning("S3 head_bucket returned client error code: %s", error_code)
            if error_code in ("404", "NoSuchBucket"):
                return False, "Configured S3 bucket does not exist"
            elif error_code in ("403", "AccessDenied"):
                return False, "Access denied to configured S3 bucket"
            return False, f"S3 error: {error_code}"
        except Exception as exc:
            logger.error("Unexpected error during S3 accessibility check: %s", type(exc).__name__)
            return False, "S3 connectivity check error"

    def generate_presigned_upload_url(
        self,
        object_key: str,
        content_type: str = "image/jpeg",
        expires_in: int = 3600,
    ) -> Dict[str, Any]:
        """Generate a pre-signed URL allowing a client to upload directly to private S3.

        PLACEHOLDER: Awaiting picture upload pipeline requirements.
        Preserves private bucket access without making objects publicly readable.
        """
        try:
            presigned_url = self.client.generate_presigned_url(
                ClientMethod="put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": object_key,
                    "ContentType": content_type,
                },
                ExpiresIn=expires_in,
            )
            return {
                "upload_url": presigned_url,
                "s3_key": object_key,
                "expires_in": expires_in,
                "bucket": self.bucket_name,
            }
        except Exception as exc:
            logger.error("Failed to generate presigned upload URL: %s", type(exc).__name__)
            raise

    def upload_bytes(
        self,
        object_key: str,
        data: bytes,
        content_type: str = "image/png",
    ) -> str:
        """Upload raw binary image data directly to private S3 bucket."""
        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=data,
                ContentType=content_type,
            )
            logger.info("Successfully uploaded %d bytes to s3://%s/%s", len(data), self.bucket_name, object_key)
            return object_key
        except Exception as exc:
            logger.error("Failed to upload bytes to s3://%s/%s: %s", self.bucket_name, object_key, exc)
            raise

    def get_object_bytes(self, object_key: str) -> Tuple[bytes, str]:
        """Download raw binary image data and content-type from private S3 bucket."""
        try:
            response = self.client.get_object(
                Bucket=self.bucket_name,
                Key=object_key,
            )
            content_type = response.get("ContentType", "image/png")
            data = response["Body"].read()
            return data, content_type
        except Exception as exc:
            logger.error("Failed to read s3://%s/%s: %s", self.bucket_name, object_key, exc)
            raise

    def generate_presigned_download_url(
        self,
        object_key: str,
        expires_in: int = 86400,
    ) -> str:
        """Generate a pre-signed download/view URL for an existing private S3 object."""
        try:
            return self.client.generate_presigned_url(
                ClientMethod="get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": object_key,
                },
                ExpiresIn=expires_in,
            )
        except Exception as exc:
            logger.error("Failed to generate presigned download URL: %s", type(exc).__name__)
            raise


@lru_cache
def get_s3_service() -> S3Service:
    """Dependency provider for S3Service singleton."""
    return S3Service()
