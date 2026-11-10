$ClusterName = "DariAi-cluster-dev"
$ServiceName = "dariai-picture-mirror-service"
$Region = "ap-south-2"

$svc = aws ecs describe-services --cluster $ClusterName --services $ServiceName --region $Region | ConvertFrom-Json
$deployments = $svc.services[0].deployments
Write-Host "Deployments count:" $deployments.Count
foreach ($d in $deployments) {
    Write-Host "Deployment:" $d.id "Status:" $d.status "Desired:" $d.desiredCount "Running:" $d.runningCount "Pending:" $d.pendingCount "Rollout:" $d.rolloutState "TaskDef:" $d.taskDefinition
}

$tasks = aws ecs list-tasks --cluster $ClusterName --service-name $ServiceName --region $Region | ConvertFrom-Json
Write-Host "Tasks:" ($tasks.taskArns -join ", ")

if ($tasks.taskArns.Count -gt 0) {
    $desc = aws ecs describe-tasks --cluster $ClusterName --tasks $tasks.taskArns --region $Region | ConvertFrom-Json
    foreach ($t in $desc.tasks) {
        $eni = ($t.attachments[0].details | Where-Object { $_.name -eq "networkInterfaceId" }).value
        Write-Host "Task:" $t.taskArn "Status:" $t.lastStatus "Health:" $t.healthStatus "TaskDef:" $t.taskDefinitionArn "ENI:" $eni
    }
}

