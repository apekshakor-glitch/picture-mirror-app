<#
.SYNOPSIS
    Automated Deployment Script for DaRI AI Picture Mirror to AWS ECS Fargate.
.DESCRIPTION
    Builds the Docker container, pushes it to Amazon ECR in ap-south-2, registers the 
    ECS Task Definition, and triggers a rolling service deployment on DariAi-cluster-dev.
.EXAMPLE
    .\scripts\deploy_ecs.ps1 -AwsAccountId "123456789012"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, HelpMessage = "Your 12-digit AWS Account ID")]
    [string]$AwsAccountId,

    [Parameter(Mandatory = $false)]
    [string]$Region = "ap-south-2",

    [Parameter(Mandatory = $false)]
    [string]$ClusterName = "DariAi-cluster-dev",

    [Parameter(Mandatory = $false)]
    [string]$ServiceName = "dariai-picture-mirror-service",

    [Parameter(Mandatory = $false)]
    [string]$RepositoryName = "dariai-picture-mirror",

    [Parameter(Mandatory = $false)]
    [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"
$EcrRegistry = "$AwsAccountId.dkr.ecr.$Region.amazonaws.com"
$ImageUri = "$EcrRegistry/${RepositoryName}:${ImageTag}"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " DaRI AI Picture Mirror - Amazon ECS Fargate Deployment" -ForegroundColor Cyan
Write-Host " Target Cluster : $ClusterName" -ForegroundColor Cyan
Write-Host " Target Region  : $Region" -ForegroundColor Cyan
Write-Host " Target Image   : $ImageUri" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# Step 1: Ensure ECR Repository Exists
Write-Host "`n[1/5] Checking ECR repository '$RepositoryName'..." -ForegroundColor Yellow
$prevEAP = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
$repoCheck = aws ecr describe-repositories --repository-names $RepositoryName --region $Region 2>&1
$ecrCode = $LASTEXITCODE
$ErrorActionPreference = $prevEAP
if ($ecrCode -ne 0) {
    Write-Host "Creating ECR repository '$RepositoryName'..." -ForegroundColor Cyan
    aws ecr create-repository --repository-name $RepositoryName --region $Region | Out-Null
    Write-Host "Repository created successfully." -ForegroundColor Green
} else {
    Write-Host "ECR repository '$RepositoryName' exists." -ForegroundColor Green
}

# Step 2: Authenticate Docker with Amazon ECR
Write-Host "`n[2/5] Authenticating Docker with Amazon ECR..." -ForegroundColor Yellow
$loginSucceeded = $false
try {
    $loginOutput = aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $EcrRegistry 2>&1
    if ($LASTEXITCODE -eq 0 -and $loginOutput -match "Login Succeeded") {
        $loginSucceeded = $true
        Write-Host "Docker authenticated successfully." -ForegroundColor Green
    }
} catch {
    # Handled below
}

if (-not $loginSucceeded) {
    Write-Host "Direct docker login encountered credential helper stub error; injecting auth token..." -ForegroundColor Yellow
    $token = aws ecr get-authorization-token --region $Region --query "authorizationData[0].authorizationToken" --output text
    $configPath = "$HOME\.docker\config.json"
    if (Test-Path $configPath) {
        $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
    } else {
        $cfg = [PSCustomObject]@{}
    }
    if (-not $cfg.auths) {
        $cfg | Add-Member -MemberType NoteProperty -Name "auths" -Value (New-Object PSObject)
    }
    $cfg.auths | Add-Member -MemberType NoteProperty -Name $EcrRegistry -Value ([PSCustomObject]@{ auth = $token }) -Force
    $cfg | ConvertTo-Json -Depth 10 | Set-Content $configPath
    Write-Host "ECR token written directly to $configPath." -ForegroundColor Green
}

# Step 3: Build and Tag Docker Image
Write-Host "`n[3/5] Building Docker container..." -ForegroundColor Yellow
docker build -t ${RepositoryName}:${ImageTag} .
docker tag ${RepositoryName}:${ImageTag} $ImageUri
Write-Host "Docker image built and tagged." -ForegroundColor Green

# Step 4: Push Image to Amazon ECR
Write-Host "`n[4/5] Pushing image to Amazon ECR..." -ForegroundColor Yellow
docker push $ImageUri
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push image to Amazon ECR."
}
Write-Host "Image successfully uploaded to ECR: $ImageUri" -ForegroundColor Green

# Step 5: Register Task Definition & Update ECS Service
Write-Host "`n[5/5] Updating ECS Task Definition & Service..." -ForegroundColor Yellow
$templatePath = Join-Path $PSScriptRoot "..\ecs\task-definition.json"
$resolvedJsonPath = Join-Path $PSScriptRoot "..\ecs\task-definition-resolved.json"

# Replace <AWS_ACCOUNT_ID> placeholder in template
(Get-Content $templatePath) -replace "<AWS_ACCOUNT_ID>", $AwsAccountId | Set-Content $resolvedJsonPath

Write-Host "Registering task definition from $resolvedJsonPath..." -ForegroundColor Cyan
$regOutput = aws ecs register-task-definition --cli-input-json file://$resolvedJsonPath --region $Region | ConvertFrom-Json
$newTaskDefArn = $regOutput.taskDefinition.taskDefinitionArn
Write-Host "Registered new task definition: $newTaskDefArn" -ForegroundColor Green

# Clean up resolved file
Remove-Item $resolvedJsonPath -ErrorAction SilentlyContinue

# Update ECS Service to deploy the new revision
Write-Host "Deploying new revision to ECS Service '$ServiceName' in cluster '$ClusterName'..." -ForegroundColor Cyan
aws ecs update-service `
    --cluster $ClusterName `
    --service $ServiceName `
    --task-definition $newTaskDefArn `
    --force-new-deployment `
    --region $Region

Write-Host "`n[SUCCESS] Deployment initiated! ECS Fargate is now performing a rolling zero-downtime deployment." -ForegroundColor Green
Write-Host "Once tasks are RUNNING inside your VPC, they will connect to RDS and S3 automatically." -ForegroundColor Green
