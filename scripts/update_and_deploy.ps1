$templatePath = "D:\DARI\dariai-picture-mirror\ecs\task-definition.json"
$resolvedJsonPath = "D:\DARI\dariai-picture-mirror\ecs\task-definition-resolved.json"
$Region = "ap-south-2"
$ClusterName = "DariAi-cluster-dev"
$ServiceName = "dariai-picture-mirror-service"

(Get-Content $templatePath) -replace "<AWS_ACCOUNT_ID>", "568199007541" | Set-Content $resolvedJsonPath
$regOutput = aws ecs register-task-definition --cli-input-json "file://$resolvedJsonPath" --region $Region | ConvertFrom-Json
$newTaskDefArn = $regOutput.taskDefinition.taskDefinitionArn
Write-Host "Registered new task definition: $newTaskDefArn"

Remove-Item $resolvedJsonPath -ErrorAction SilentlyContinue

Write-Host "Updating ECS Service $ServiceName to revision $newTaskDefArn..."
aws ecs update-service `
    --cluster $ClusterName `
    --service $ServiceName `
    --task-definition $newTaskDefArn `
    --force-new-deployment `
    --region $Region | Out-Null

Write-Host "Service update initiated successfully!"

