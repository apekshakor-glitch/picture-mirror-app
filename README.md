# DaRI AI Picture Mirror - Backend API

> Production-oriented, modular FastAPI backend skeleton for the **DaRI AI Picture Mirror** application, architected for Amazon ECS Fargate, AWS RDS PostgreSQL, and Amazon S3 in `ap-south-2` (Hyderabad).

---

## Table of Contents

0. [🚀 Intern Onboarding & Quickstart Guide](#-intern-onboarding--quickstart-guide)
1. [Project Overview and Architecture](#1-project-overview-and-architecture)
2. [Folder and File Structure](#2-folder-and-file-structure)
3. [Required Software](#3-required-software)
4. [Creating a Python Virtual Environment on Windows](#4-creating-a-python-virtual-environment-on-windows)
5. [Installing Dependencies](#5-installing-dependencies)
6. [Configuring Environment Variables (.env)](#6-configuring-environment-variables-env)
7. [Running the API Locally](#7-running-the-api-locally)
8. [Using Interactive Swagger UI & OpenAPI Docs](#8-using-interactive-swagger-ui--openapi-docs)
9. [Running Tests](#9-running-tests)
10. [Running the Docker Container Locally](#10-running-the-docker-container-locally)
11. [Configuring AWS Credentials for Local Development](#11-configuring-aws-credentials-for-local-development)
12. [AWS ECS Task Roles & IAM Permissions](#12-aws-ecs-task-roles--iam-permissions)
13. [Connecting to Private RDS PostgreSQL via VPC](#13-connecting-to-private-rds-postgresql-via-vpc)
14. [Running Alembic Migrations Safely](#14-running-alembic-migrations-safely)
15. [Production Deployment Roadmap (ECR & ECS Fargate)](#15-production-deployment-roadmap-ecr--ecs-fargate)
16. [Implemented Features vs. Pending Placeholders](#16-implemented-features-vs-pending-placeholders)

---

---

## 🚀 Intern Onboarding & Quickstart Guide

Welcome to the **DaRI AI Picture Mirror** project! This guide walks you through setting up, running, and contributing to the application in minutes.

### 🧩 What is This Project?
This repository is a full-stack AI-powered arcade game and image processing platform:
- **Backend**: Python 3.12 + FastAPI with asynchronous REST routes (`/api/players`, `/api/auth`, `/api/tournaments`, `/health`).
- **Database**: PostgreSQL (AWS RDS) managed with SQLAlchemy 2.0 ORM and Alembic migrations.
- **Frontend**: Vanilla JavaScript / HTML5 Arcade game located in `www/` (served directly by FastAPI at `/`).
- **AI Engines**: Bespoke prompt generation supporting OpenAI DALL-E with automatic zero-config fallback to **Pollinations AI** and offline generative canvas.

---

### ⚡ Quickstart (Choose Your Path)

#### Option 1: Run with Docker (Easiest & Fastest)
If you have Docker Desktop installed, you can build and run everything in two commands:
```bash
# 1. Build the Docker image
docker build -t picture-mirror-app .

# 2. Run the container
docker run -p 8000:8000 picture-mirror-app
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser to play the game!

---

#### Option 2: Local Python Setup (For Backend & Full-Stack Developers)

**Prerequisites:** Python 3.11+ installed (`python --version`).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/apekshakor-glitch/picture-mirror-app.git
   cd picture-mirror-app
   ```

2. **Create and activate a virtual environment:**
   - **Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Set up your environment variables:**
   Copy the template configuration:
   ```bash
   cp .env.example .env   # On Windows PowerShell: copy .env.example .env
   ```
   *(Optional)* If you run a local PostgreSQL instance, update `DATABASE_URL` or `DB_*` in `.env`.

5. **Start the development server with live reload:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Open in your browser:**
   - **Arcade Web Game:** [http://localhost:8000/](http://localhost:8000/)
   - **Interactive API Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Alternative ReDoc UI:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

#### Option 3: Frontend-Only Development (For UI / CSS / JS Designers)
If you are only editing game UI, audio, or visual effects in `www/`:
- Edit files directly in `www/` (`index.html`, `style.css`, `app.js`).
- If the FastAPI backend is running, refresh `http://localhost:8000/` to see your changes immediately.
- Alternatively, launch any static file server (e.g. VS Code **Live Server** extension, or `python -m http.server 8000 -d www`). The app automatically falls back to client-side storage if a live backend is unreachable!

---

### 🧪 Running Tests
Verify your local environment and tests before pushing changes:
```bash
pytest -v
```

---

## 1. Project Overview and Architecture

The **DaRI AI Picture Mirror** backend provides an asynchronous, scalable RESTful API designed to serve mirror-transformation, picture-processing, and storage workflows.

```text
       +--------------------------------------------------------+
       |               AWS VPC (ap-south-2 Region)              |
       |                                                        |
       |    +--------------------+       +-----------------+    |
Client |    | Application Load   |       | Amazon S3       |    |
------>|--->| Balancer (Port 80) |       | (Private Bucket)|<---+
       |    +---------+----------+       +--------+--------+    |
       |              |                           ^             |
       |              v                           |             |
       |    +--------------------+                | IAM Task    |
       |    | ECS Fargate Task   |----------------+ Role        |
       |    | (FastAPI: Port 8000|                              |
       |    +---------+----------+                              |
       |              | Private Subnet Security Group           |
       |              v                                         |
       |    +--------------------+                              |
       |    | RDS PostgreSQL     |                              |
       |    | (Port 5432)        |                              |
       |    +--------------------+                              |
       +--------------------------------------------------------+
```

### Key Principles

- **Zero Hardcoded Secrets**: Passwords, AWS keys, and connection strings are never committed or exposed in logs.
- **Graceful Lifecycle**: Handles container `SIGTERM` signals for zero-downtime rolling ECS deployments.
- **Non-Destructive Boot**: Database tables are never dropped or automatically altered upon container startup.
- **Isolated Network Security**: RDS and S3 are completely private; traffic stays within the AWS VPC backbone.

---

## 2. Folder and File Structure

```text
dariai-picture-mirror/
├── app/
│   ├── __init__.py                 # Package declaration and versioning (0.1.0)
│   ├── main.py                     # FastAPI application factory, lifespan, CORS, error handling
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               # Pydantic Settings, safe URI generation, password masking
│   │   └── logging.py              # Structured logging and sensitive credential filter
│   ├── db/
│   │   ├── __init__.py             # Exports Base, engine, get_db, readiness probe
│   │   ├── base.py                 # SQLAlchemy 2.x DeclarativeBase class
│   │   └── session.py              # Connection pooling, sessionmaker, and DB ping
│   ├── models/
│   │   ├── __init__.py             # Model imports for Alembic schema discovery
│   │   └── picture.py              # SQLAlchemy 2.x Picture model placeholder
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── health.py               # Pydantic models for /, /health, /health/ready, /health/s3
│   │   └── picture.py              # Pydantic models for picture requests/responses
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py           # Health checks and readiness diagnostic endpoints
│   │       └── pictures.py         # Placeholder routes for picture processing
│   └── services/
│       ├── __init__.py
│       ├── s3_service.py           # Boto3 S3 client, read-only head_bucket check, presigned URLs
│       └── picture_service.py      # Business logic placeholder isolating DB and S3 from routes
├── alembic/
│   ├── env.py                      # Dynamic migration environment reading app settings
│   ├── script.py.mako              # Revision file template
│   └── versions/
│       ├── .gitkeep
│       └── 001_initial_pictures_schema.py # Initial migration for pictures table
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Pytest test environment fixtures (TestClient, mock DB/S3)
│   ├── test_root.py                # Tests for GET /
│   ├── test_health.py              # Tests for /health, /health/ready, /health/s3 (success & failure)
│   ├── test_pictures.py            # Tests for picture listing and placeholder endpoints
│   ├── test_config.py              # Configuration validation, URL encoding, password masking
│   └── test_s3_service.py          # Unit tests for S3Service with mocked Boto3 client
├── .env.example                    # Template for development environment variables
├── .gitignore                      # Git ignore file preventing secret/cache leakage
├── .dockerignore                   # Docker build ignore excluding secrets, git, tests, cache
├── Dockerfile                      # Production Dockerfile (Python 3.12-slim, non-root user, healthcheck)
├── requirements.txt                # Pinned, compatible Python dependencies
├── alembic.ini                     # Alembic migration configuration
└── README.md                       # Comprehensive setup and operations manual
```

---

## 3. Required Software

Before running this project, ensure the following software is installed on your workstation:

- **Python**: Version `3.12` or `3.13` (64-bit).
- **Git**: For version control.
- **Docker Desktop**: For building and running container images locally.
- **AWS CLI v2**: For interacting with AWS services and testing local credentials.
- **PostgreSQL Client Tools (optional)**: e.g., `psql` or `pgAdmin` for database administration.

---

## 4. Creating a Python Virtual Environment on Windows

Open PowerShell or Command Prompt in the project root:

```powershell
# Navigate to the project folder
cd D:\DARI\dariai-picture-mirror

# Create virtual environment named .venv using Python 3.12/3.13
python -m venv .venv

# Activate the virtual environment in PowerShell
.\.venv\Scripts\Activate.ps1

# (Alternative) If using Command Prompt (cmd.exe):
# .venv\Scripts\activate.bat
```

> **PowerShell ExecutionPolicy Note**: If you encounter `execution of scripts is disabled on this system`, run PowerShell as Administrator and execute:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## 5. Installing Dependencies

With the virtual environment active:

```powershell
# Upgrade pip to latest version
python -m pip install --upgrade pip

# Install all pinned production and test dependencies
pip install -r requirements.txt
```

---

## 6. Configuring Environment Variables (`.env`)

Never commit `.env` to Git. Create your local configuration by copying `.env.example`:

```powershell
# Copy template to .env
copy .env.example .env
```

Open `.env` in an editor and update the fields:

```ini
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
LOG_LEVEL=INFO

# PostgreSQL RDS Configuration
# Set the password provided by your AWS database administrator
DB_HOST=dariai-picture-mirror-dev.c7em0as8esn6.ap-south-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_secure_db_password_here

# S3 Configuration
AWS_REGION=ap-south-2
S3_BUCKET_NAME=dari-ai-picture-mirror-dev

# Allowed frontend origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

> **Special Characters in Passwords**: The application automatically URL-encodes special characters in passwords (such as `@`, `:`, `#`, `/`, `%`) when constructing the database connection URI.

---

## 7. Running the API Locally

To start the FastAPI development server with auto-reload:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Output:
```text
INFO:     Started server process
INFO:     Waiting for application startup.
2026-11-03 20:46:17 | INFO    | dariai_picture_mirror:29 | Starting DaRI AI Picture Mirror API in [development] environment
2026-11-03 20:46:17 | INFO    | dariai_picture_mirror:30 | Configured target S3 bucket: dari-ai-picture-mirror-dev (Region: ap-south-2)
2026-11-03 20:46:17 | INFO    | dariai_picture_mirror:31 | Configured database target: postgresql+psycopg2://postgres:***@dariai-picture-mirror-dev...
2026-11-03 20:46:17 | INFO    | dariai_picture_mirror:32 | Swagger documentation available at /docs
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## 8. Using Interactive Swagger UI & OpenAPI Docs

Once the application is running, open your web browser:

- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Raw OpenAPI Specification**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### Available Initial Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root status message, active environment, and version |
| `GET` | `/health` | Lightweight liveness probe (safe for load balancer health checks) |
| `GET` | `/health/ready` | Database readiness check (`SELECT 1`); returns 200 if connected, 503 if unavailable |
| `GET` | `/health/s3` | Read-only S3 bucket probe (`head_bucket`); returns 200 if accessible, 503 if unauthorized |
| `GET` | `/api/v1/pictures` | Placeholder endpoint returning documented empty list |
| `POST`| `/api/v1/pictures/process` | Placeholder endpoint returning 202 Accepted acknowledgment |

---

## 9. Running Tests

The test suite runs completely offline with mocked AWS and database components. No real credentials or live network connections are required.

```powershell
# Run all tests with verbose output
python -m pytest -v

# Run with test coverage report (optional)
python -m pytest -v --cov=app
```

Expected result:
```text
======================== 21 passed in 0.20s ========================
```

---

## 10. Running the Docker Container Locally

### 1. Build the Docker Image

```powershell
docker build -t dariai-picture-mirror:latest .
```

### 2. Run the Container

```powershell
docker run --rm -p 8000:8000 --env-file .env --name dariai-picture-mirror dariai-picture-mirror:latest
```

### 3. Verify Container Health

```powershell
curl http://localhost:8000/health
```

### Security and Networking Notes

- **Port 8000**: The container listens on internal port `8000`. In Amazon ECS Fargate, this port is mapped to target groups behind an Application Load Balancer (ALB).
- **Non-Root Execution**: The container runs as unprivileged system user `appuser` (UID 1001) for container security compliance.
- **Graceful Termination**: The container uses exec form (`CMD ["uvicorn", ...]`) to directly receive `SIGTERM` signals from ECS Fargate, allowing ongoing requests to complete before closing.

---

## 11. Configuring AWS Credentials for Local Development

Never hardcode AWS keys in `.env` or application source code. For local testing with real AWS resources, use the standard AWS CLI credential chain:

```powershell
# Configure credentials via AWS CLI
aws configure --profile dariai-dev
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: ap-south-2
# Default output: json
```

Then specify the profile before running:

```powershell
$env:AWS_PROFILE="dariai-dev"
uvicorn app.main:app --reload
```

In production on ECS Fargate, **no keys are needed** because the ECS Task IAM Role provides temporary credentials automatically.

---

## 12. AWS ECS Task Roles & IAM Permissions

In AWS ECS Fargate, two separate IAM roles are utilized:

### A. ECS Task Execution Role (`ecsTaskExecutionRole`)
Used by the **AWS ECS agent** before the container starts:
- Pulls Docker images from private Amazon ECR.
- Sends container stdout/stderr logs to Amazon CloudWatch Logs.
- Pulls secrets from AWS Secrets Manager or SSM Parameter Store into environment variables.

### B. ECS Task Role (Application Role)
Assumed by the **FastAPI application itself** inside the running container:
- Provides permissions to access AWS S3:
  - `s3:ListBucket`
  - `s3:GetBucketLocation`
  - `s3:GetObject`
  - `s3:PutObject`
- Restricts operations exclusively to `arn:aws:s3:::dari-ai-picture-mirror-dev` and its contents (`/*`).
- Does **not** grant public bucket permissions or permission to delete the bucket.

---

## 13. Connecting to Private RDS PostgreSQL via VPC

The RDS database `dariai-picture-mirror-dev` resides in private VPC subnets and **cannot be reached from the public internet**.

### Production Connectivity (ECS Fargate -> RDS)
1. Both the ECS Fargate Service and RDS PostgreSQL are deployed within the same VPC in `ap-south-2`.
2. The **RDS Security Group** allows inbound traffic on port `5432` only from the **ECS Task Security Group**.
3. No public IP addresses are assigned to the RDS instance.

### Local Development Connectivity Options
Because RDS is private, running the backend on a local workstation requires one of these secure access patterns:

1. **AWS Client VPN / Site-to-Site VPN**: Connect your local computer directly to the AWS VPC network.
2. **SSM Port Forwarding via Bastion Host**:
   ```powershell
   aws ssm start-session `
     --target <bastion-instance-id> `
     --document-name AWS-StartPortForwardingSessionToRemoteHost `
     --parameters '{"host":["dariai-picture-mirror-dev.c7em0as8esn6.ap-south-2.rds.amazonaws.com"],"portNumber":["5432"],"localPortNumber":["5432"]}'
   ```
   Then set `DB_HOST=127.0.0.1` and `DB_PORT=5432` in your local `.env`.
3. **Local PostgreSQL Instance**: Run a local PostgreSQL container for offline development:
   ```powershell
   docker run -d --name local-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
   ```

---

## 14. Running Alembic Migrations Safely

Database schema migrations are managed through **Alembic**. Tables are **never** created or altered automatically at application startup.

### 1. Preview Migration SQL Without Executing (Safe Offline Mode)

```powershell
python -m alembic upgrade head --sql
```

This prints the exact SQL statements that would be executed, allowing manual review.

### 2. Apply Migrations to Target Database

When connected to the database (via VPN, Bastion, or in ECS):

```powershell
python -m alembic upgrade head
```

### 3. Check Current Migration Status

```powershell
python -m alembic current
```

### 4. Roll Back Last Migration (If Necessary)

```powershell
python -m alembic downgrade -1
```

---

## 15. Production Deployment Roadmap (ECR & ECS Fargate)

When ready to deploy the container image to Amazon ECS:

### Step 1: Authenticate Docker to Amazon ECR
```powershell
aws ecr get-login-password --region ap-south-2 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.ap-south-2.amazonaws.com
```

### Step 2: Build and Tag Image
```powershell
docker build -t dariai-picture-mirror:latest .
docker tag dariai-picture-mirror:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.ap-south-2.amazonaws.com/dariai-picture-mirror:latest
```

### Step 3: Push Image to ECR
```powershell
docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.ap-south-2.amazonaws.com/dariai-picture-mirror:latest
```

### Step 4: Register or Update ECS Task Definition
In the task definition JSON:
- Set image to `<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.ap-south-2.amazonaws.com/dariai-picture-mirror:latest`.
- Map container port `8000`.
- Inject `DB_PASSWORD` securely via `secrets` referencing AWS Secrets Manager:
  ```json
  "secrets": [
    {
      "name": "DB_PASSWORD",
      "valueFrom": "arn:aws:secretsmanager:ap-south-2:<ACCOUNT_ID>:secret:dariai/rds/password"
    }
  ]
  ```
- Assign the `ECS Task Role` and `ECS Execution Role`.

### Step 5: Update the ECS Service
```powershell
aws ecs update-service `
  --cluster DariAi-cluster-dev `
  --service dariai-picture-mirror-service `
  --force-new-deployment `
  --region ap-south-2
```

---

## 16. Implemented Features vs. Pending Placeholders

| Component | Status | Details |
|---|---|---|
| **FastAPI Core Skeleton** | **Implemented** | Modular app factory, routers, lifespan, CORS, error handling |
| **Pydantic Configuration** | **Implemented** | Environment loading, safe URI building, password masking |
| **Structured Logging** | **Implemented** | Formatted logs with sensitive credential redactor |
| **SQLAlchemy 2.x Engine** | **Implemented** | Pooled connections, `get_db` dependency, `SELECT 1` ping |
| **Alembic Migrations** | **Implemented** | Configured for dynamic settings; initial migration `001` created |
| **Safe Health Probes** | **Implemented** | `/health`, `/health/ready` (DB), `/health/s3` (read-only head_bucket) |
| **S3 Service** | **Implemented** | Read-only accessibility check, credential-chain resolution |
| **Docker Container** | **Implemented** | Python 3.12-slim, non-root user, SIGTERM handling, HEALTHCHECK |
| **Offline Test Suite** | **Implemented** | 21 passing pytest tests covering root, health, s3, config, routes |
| **Picture Mirror Processing** | *Pending Requirements* | Placeholder service and empty list endpoint awaiting AI model specifications |
| **S3 Upload / Download Workflow** | *Pending Requirements* | Presigned URL placeholder methods ready for frontend upload contract |
| **User Authentication / Auth0 / JWT**| *Pending Requirements* | Production auth deliberately omitted until authentication provider is selected |
| **ECS Service Deployment** | *Pending AWS Trigger* | Dockerfile and deployment commands documented; awaiting ECR push & ECS task update |
