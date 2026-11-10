$Region = "ap-south-2"
$EcrRegistry = "568199007541.dkr.ecr.ap-south-2.amazonaws.com"
$token = aws ecr get-authorization-token --region $Region --query "authorizationData[0].authorizationToken" --output text
$configPath = Join-Path $HOME ".docker\config.json"
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
Write-Host "ECR auth token refreshed successfully in config.json"

