"""Diagnostic script to test live RDS and S3 upload/connectivity.

Runs safe checks:
1. S3: Attempts to connect to Amazon S3, inspect the bucket, and optionally upload a test probe object.
2. RDS: Attempts TCP connection and a SELECT 1 query using credentials in .env.
"""

import os
import socket
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import get_settings


def test_s3_connection() -> None:
    """Test AWS S3 credentials and connectivity."""
    print("\n--- 1. Testing AWS S3 Connectivity ---")
    settings = get_settings()
    bucket = settings.S3_BUCKET_NAME
    region = settings.AWS_REGION
    print(f"Target Bucket : {bucket}")
    print(f"Target Region : {region}")

    try:
        import boto3
        from botocore.exceptions import ClientError, NoCredentialsError

        session = boto3.Session()
        creds = session.get_credentials()
        if not creds:
            print("[FAIL] No AWS credentials found on this machine.")
            print("  -> Fix: Provide AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY in your environment or .env,")
            print("          or run 'aws configure'.")
            return

        print(f"[OK] AWS Credentials detected (Source: {creds.method})")
        s3 = session.client("s3", region_name=region)

        # Probe bucket accessibility
        print(f"Checking access to '{bucket}'...")
        s3.head_bucket(Bucket=bucket)
        print(f"[OK] S3 Bucket '{bucket}' is accessible!")

        # Perform a safe test upload
        test_key = "diagnostics/test_connectivity.txt"
        test_payload = b"DaRI AI Picture Mirror - Connectivity Test"
        print(f"Uploading test probe to 's3://{bucket}/{test_key}'...")
        s3.put_object(Bucket=bucket, Key=test_key, Body=test_payload)
        print(f"[SUCCESS] Successfully uploaded test object to S3: s3://{bucket}/{test_key}")

    except NoCredentialsError:
        print("[FAIL] AWS credentials not found.")
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "Unknown")
        print(f"[FAIL] S3 ClientError: {code}")
        if code == "403" or code == "AccessDenied":
            print("  -> Fix: Your AWS credentials lack s3:PutObject or s3:ListBucket permissions for this bucket.")
        elif code == "404" or code == "NoSuchBucket":
            print(f"  -> Fix: The bucket '{bucket}' does not exist in region '{region}'.")
    except Exception as e:
        print(f"[FAIL] Unexpected error connecting to S3: {e}")


def test_rds_connection() -> None:
    """Test PostgreSQL RDS TCP route and database authentication."""
    print("\n--- 2. Testing PostgreSQL RDS Connectivity ---")
    settings = get_settings()
    host = settings.DB_HOST
    port = settings.DB_PORT
    user = settings.DB_USER
    password = settings.DB_PASSWORD

    print(f"Target RDS Host: {host}:{port}")
    print(f"Target Database: {settings.DB_NAME}")
    print(f"Database User  : {user}")
    print(f"Password Set   : {'Yes' if password else 'No (Empty in .env)'}")

    # Step 1: TCP Port Reachability Check
    print(f"Probing TCP port {port} on {host}...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(4.0)
    try:
        result = sock.connect_ex((host, port))
        if result != 0:
            print(f"[FAIL] Cannot reach {host}:{port} via TCP (Error code: {result}).")
            print("  -> Cause: RDS is inside a private VPC subnet and does not accept direct public internet traffic.")
            print("  -> Solutions:")
            print("     1. Connect to your organization's AWS Client VPN into the VPC.")
            print("     2. Or use AWS SSM port forwarding / SSH tunnel through a bastion host.")
            print("     3. In production, this backend runs inside ECS Fargate in the SAME VPC as RDS,")
            print("        where it connects directly via private IP without internet exposure.")
            return
        print(f"[OK] TCP port {port} is open and reachable!")
    except Exception as e:
        print(f"[FAIL] TCP socket error: {e}")
        return
    finally:
        sock.close()

    # Step 2: Database Query Check
    if not password:
        print("[NOTICE] TCP port is open, but DB_PASSWORD is empty in .env. Skipping database authentication test.")
        return

    print("Attempting database connection and lightweight query...")
    try:
        from sqlalchemy import create_engine, text

        engine = create_engine(settings.sqlalchemy_database_uri, connect_args={"connect_timeout": 5})
        with engine.connect() as conn:
            val = conn.execute(text("SELECT 1")).scalar()
            print(f"[SUCCESS] Database authenticated and executed test query successfully! (Result: {val})")
    except Exception as e:
        print(f"[FAIL] Database query failed: {type(e).__name__}")
        print("  -> Verify that DB_PASSWORD and DB_USER match the RDS credentials.")


if __name__ == "__main__":
    print("==================================================")
    print(" DaRI AI Picture Mirror - Live Connectivity Probe ")
    print("==================================================")
    test_s3_connection()
    test_rds_connection()
