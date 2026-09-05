param([Parameter(Mandatory = $true)][string]$Name)
$ErrorActionPreference = "Stop"
Write-Host "Adding EF Core migration '$Name'..." -ForegroundColor Cyan
dotnet ef migrations add $Name `
  --project .\__GamePascal__.Database.csproj `
  --startup-project ..\__GamePascal__.Consumer\__GamePascal__.Consumer.csproj
