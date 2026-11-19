"""Unit tests for S3Service using mocked boto3 clients."""

from unittest.mock import MagicMock
from botocore.exceptions import ClientError, EndpointConnectionError, NoCredentialsError

from app.services.s3_service import S3Service


def test_s3_check_bucket_accessibility_success() -> None:
    """Test successful S3 bucket head_bucket call."""
    mock_client = MagicMock()
    mock_client.head_bucket.return_value = {"ResponseMetadata": {"HTTPStatusCode": 200}}

    service = S3Service(
        bucket_name="test-bucket",
        region_name="ap-south-2",
        client=mock_client,
    )
    is_ok, detail = service.check_bucket_accessibility()
    assert is_ok is True
    assert "accessible" in (detail or "")
    mock_client.head_bucket.assert_called_once_with(Bucket="test-bucket")


def test_s3_check_bucket_accessibility_no_credentials() -> None:
    """Test handling when AWS credentials are not found."""
    mock_client = MagicMock()
    mock_client.head_bucket.side_effect = NoCredentialsError()

    service = S3Service(
        bucket_name="test-bucket",
        region_name="ap-south-2",
        client=mock_client,
    )
    is_ok, detail = service.check_bucket_accessibility()
    assert is_ok is False
    assert detail == "AWS credentials not configured"


def test_s3_check_bucket_accessibility_404_not_found() -> None:
    """Test handling when S3 bucket does not exist."""
    mock_client = MagicMock()
    error_response = {"Error": {"Code": "404", "Message": "Not Found"}}
    mock_client.head_bucket.side_effect = ClientError(error_response, "HeadBucket")

    service = S3Service(
        bucket_name="test-bucket",
        region_name="ap-south-2",
        client=mock_client,
    )
    is_ok, detail = service.check_bucket_accessibility()
    assert is_ok is False
    assert "does not exist" in (detail or "")


def test_s3_check_bucket_accessibility_403_access_denied() -> None:
    """Test handling when IAM permissions deny bucket access."""
    mock_client = MagicMock()
    error_response = {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}}
    mock_client.head_bucket.side_effect = ClientError(error_response, "HeadBucket")

    service = S3Service(
        bucket_name="test-bucket",
        region_name="ap-south-2",
        client=mock_client,
    )
    is_ok, detail = service.check_bucket_accessibility()
    assert is_ok is False
    assert "Access denied" in (detail or "")


def test_s3_check_bucket_accessibility_endpoint_error() -> None:
    """Test handling when network cannot reach S3 endpoint."""
    mock_client = MagicMock()
    mock_client.head_bucket.side_effect = EndpointConnectionError(endpoint_url="https://s3.ap-south-2.amazonaws.com")

    service = S3Service(
        bucket_name="test-bucket",
        region_name="ap-south-2",
        client=mock_client,
    )
    is_ok, detail = service.check_bucket_accessibility()
    assert is_ok is False
    assert "unreachable" in (detail or "")


def test_s3_generate_presigned_upload_url() -> None:
    """Test presigned upload URL generation."""
    mock_client = MagicMock()
    mock_client.generate_presigned_url.return_value = "https://s3.ap-south-2.amazonaws.com/test-bucket/pictures/test.jpg?AWSAccessKeyId=..."

    service = S3Service(
        bucket_name="test-bucket",
        region_name="ap-south-2",
        client=mock_client,
    )
    res = service.generate_presigned_upload_url("pictures/test.jpg")
    assert "upload_url" in res
    assert res["s3_key"] == "pictures/test.jpg"
    assert res["bucket"] == "test-bucket"
    mock_client.generate_presigned_url.assert_called_once()


def test_s3_generate_presigned_download_url() -> None:
    """Test presigned download URL generation."""
    mock_client = MagicMock()
    mock_client.generate_presigned_url.return_value = "https://s3.ap-south-2.amazonaws.com/test-bucket/pictures/test.jpg?Signature=..."

    service = S3Service(
        bucket_name="test-bucket",
        region_name="ap-south-2",
        client=mock_client,
    )
    res = service.generate_presigned_download_url("pictures/test.jpg")
    assert "https://" in res
    mock_client.generate_presigned_url.assert_called_once()
