param(
  [string]$EnvFile = (Join-Path $PSScriptRoot "cloudflare.env"),
  [switch]$SkipBackend,
  [ValidateSet("worker", "container")]
  [string]$BackendMode = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$results = [System.Collections.Generic.List[object]]::new()

function Add-CheckResult {
  param(
    [string]$Status,
    [string]$Item,
    [string]$Detail
  )

  $results.Add(
    [PSCustomObject]@{
      Status = $Status
      Item = $Item
      Detail = $Detail
    }
  ) | Out-Null
}

function Test-RequiredPath {
  param(
    [string]$Label,
    [string]$Path,
    [ValidateSet("File", "Directory")]
    [string]$ExpectedType
  )

  if (-not (Test-Path -Path $Path)) {
    Add-CheckResult -Status "FAIL" -Item $Label -Detail "Not found: $Path"
    return
  }

  $item = Get-Item -Path $Path
  if ($ExpectedType -eq "File" -and $item.PSIsContainer) {
    Add-CheckResult -Status "FAIL" -Item $Label -Detail "Expected file, got directory: $Path"
    return
  }

  if ($ExpectedType -eq "Directory" -and -not $item.PSIsContainer) {
    Add-CheckResult -Status "FAIL" -Item $Label -Detail "Expected directory, got file: $Path"
    return
  }

  Add-CheckResult -Status "PASS" -Item $Label -Detail $Path
}

function Test-CommandExists {
  param([string]$Name)

  if (Get-Command $Name -ErrorAction SilentlyContinue) {
    Add-CheckResult -Status "PASS" -Item "Command: $Name" -Detail "Available in PATH"
  } else {
    Add-CheckResult -Status "FAIL" -Item "Command: $Name" -Detail "Missing from PATH"
  }
}

function Resolve-DockerCommand {
  $dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
  if ($dockerCommand) {
    return [PSCustomObject]@{
      Command = $dockerCommand.Source
      Detail = "Available in PATH"
    }
  }

  $candidatePaths = @()
  if (-not [string]::IsNullOrWhiteSpace($env:DOCKER_PATH)) {
    $candidatePaths += $env:DOCKER_PATH
  }

  $candidatePaths += @(
    "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
  )

  foreach ($candidate in $candidatePaths) {
    if (Test-Path -Path $candidate -PathType Leaf) {
      $dockerDir = Split-Path -Path $candidate -Parent
      if (-not (($env:Path -split ";") -contains $dockerDir)) {
        $env:Path = "$dockerDir;$($env:Path)"
      }

      return [PSCustomObject]@{
        Command = $candidate
        Detail = "Found at $candidate (PATH patched for current session)"
      }
    }
  }

  return $null
}

function Invoke-NativeCapture {
  param(
    [string]$Exe,
    [string[]]$CommandArgs
  )

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $output = & $Exe @CommandArgs 2>&1
  }
  finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  return [PSCustomObject]@{
    Output = @($output)
    ExitCode = $LASTEXITCODE
  }
}

function Get-FirstUsefulLine {
  param([object[]]$Lines)

  $normalized = @($Lines | ForEach-Object { "$_".Trim() } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
  if (-not $normalized) {
    return ""
  }

  $preferred = $normalized | Where-Object {
    $_ -match "ERROR|error|failed|request returned|cannot|not running|not found|denied"
  } | Select-Object -First 1

  if ($preferred) {
    return $preferred
  }

  return ($normalized | Select-Object -First 1)
}

function Import-EnvFile {
  param([string]$Path)

  Get-Content -Path $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
      return
    }

    $idx = $line.IndexOf("=")
    if ($idx -le 0) {
      return
    }

    $key = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim()

    if ($value.Length -ge 2) {
      if (
        ($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))
      ) {
        $value = $value.Substring(1, $value.Length - 2)
      }
    }

    if ([string]::IsNullOrWhiteSpace($value)) {
      Remove-Item -Path "Env:$key" -ErrorAction SilentlyContinue
    } else {
      Set-Item -Path "Env:$key" -Value $value
    }
  }
}

function Get-EnvValue {
  param([string]$Name)

  $item = Get-Item -Path "Env:$Name" -ErrorAction SilentlyContinue
  if ($null -eq $item) {
    return ""
  }

  return $item.Value
}

Write-Host "Cloudflare deployment readiness check" -ForegroundColor Cyan
Write-Host "Repo: $RepoRoot"
if ($SkipBackend) {
  Write-Host "Mode: pages-only (-SkipBackend)" -ForegroundColor Yellow
}

if (Test-Path -Path $EnvFile) {
  Import-EnvFile -Path $EnvFile
}

if (-not [string]::IsNullOrWhiteSpace($BackendMode)) {
  $env:CF_BACKEND_MODE = $BackendMode
}

if ([string]::IsNullOrWhiteSpace($env:CF_BACKEND_MODE)) {
  $env:CF_BACKEND_MODE = "worker"
}

$backendMode = $env:CF_BACKEND_MODE.Trim().ToLowerInvariant()
if ($backendMode -notin @("worker", "container")) {
  Add-CheckResult -Status "FAIL" -Item "Backend mode" -Detail "Invalid CF_BACKEND_MODE=$backendMode (allowed: worker, container)"
  $backendMode = "worker"
} else {
  Add-CheckResult -Status "PASS" -Item "Backend mode" -Detail $backendMode
}

Test-RequiredPath -Label "frontend dir" -Path (Join-Path $RepoRoot "frontend") -ExpectedType "Directory"
Test-RequiredPath -Label "backend dir" -Path (Join-Path $RepoRoot "backend") -ExpectedType "Directory"
Test-RequiredPath -Label "backend-admin dir" -Path (Join-Path $RepoRoot "backend-admin") -ExpectedType "Directory"
Test-RequiredPath -Label "deploy script" -Path (Join-Path $RepoRoot "deploy\deploy-cloudflare.ps1") -ExpectedType "File"
if (-not $SkipBackend) {
  $backendWranglerConfig = if ($backendMode -eq "container") { "wrangler.containers.toml" } else { "wrangler.toml" }
  Test-RequiredPath -Label "backend config" -Path (Join-Path $RepoRoot "backend\$backendWranglerConfig") -ExpectedType "File"
  Test-RequiredPath -Label "typeorm datasource" -Path (Join-Path $RepoRoot "backend\src\config\data-source.ts") -ExpectedType "File"
  if ($backendMode -eq "container") {
    Test-RequiredPath -Label "container entry" -Path (Join-Path $RepoRoot "backend\cloudflare\index.ts") -ExpectedType "File"
    Test-RequiredPath -Label "backend Dockerfile" -Path (Join-Path $RepoRoot "backend\Dockerfile") -ExpectedType "File"
  } else {
    Test-RequiredPath -Label "worker entry" -Path (Join-Path $RepoRoot "backend\cloudflare\worker.ts") -ExpectedType "File"
  }
}

Test-CommandExists -Name "npm"
Test-CommandExists -Name "npx"
$dockerCommandInfo = $null
if (-not $SkipBackend -and $backendMode -eq "container") {
  $dockerCommandInfo = Resolve-DockerCommand
  if ($dockerCommandInfo) {
    Add-CheckResult -Status "PASS" -Item "Command: docker" -Detail $dockerCommandInfo.Detail
  } else {
    Add-CheckResult -Status "FAIL" -Item "Command: docker" -Detail "Missing from PATH and common install locations"
  }
} elseif (-not $SkipBackend) {
  Add-CheckResult -Status "PASS" -Item "Command: docker" -Detail "Skipped (backend mode=worker)"
}

if (-not $SkipBackend -and $backendMode -eq "container" -and $dockerCommandInfo) {
  $dockerInfoResult = Invoke-NativeCapture -Exe $dockerCommandInfo.Command -CommandArgs @("info")
  if ($dockerInfoResult.ExitCode -eq 0) {
    Add-CheckResult -Status "PASS" -Item "Docker daemon" -Detail "docker info succeeded"
  } else {
    $detail = Get-FirstUsefulLine -Lines $dockerInfoResult.Output
    if (-not $detail) {
      $detail = "docker info failed. Start Docker Desktop (or daemon) before deploying backend."
    }
    Add-CheckResult -Status "FAIL" -Item "Docker daemon" -Detail $detail
  }
} elseif (-not $SkipBackend) {
  Add-CheckResult -Status "PASS" -Item "Docker daemon" -Detail "Skipped (backend mode=worker)"
}

$wranglerResult = Invoke-NativeCapture -Exe "npx" -CommandArgs @("wrangler", "--version")
if ($wranglerResult.ExitCode -eq 0) {
  $detail = ($wranglerResult.Output | Select-Object -First 1) -join ""
  Add-CheckResult -Status "PASS" -Item "Wrangler" -Detail $detail
} else {
  $detail = (($wranglerResult.Output | Select-Object -First 1) -join "").Trim()
  if (-not $detail) {
    $detail = "Unable to run npx wrangler --version"
  }
  Add-CheckResult -Status "FAIL" -Item "Wrangler" -Detail $detail
}

if (-not (Test-Path -Path $EnvFile)) {
  Add-CheckResult -Status "FAIL" -Item "cloudflare.env" -Detail "Not found: $EnvFile"
} else {
  Add-CheckResult -Status "PASS" -Item "cloudflare.env" -Detail $EnvFile
  Import-EnvFile -Path $EnvFile
  if (-not [string]::IsNullOrWhiteSpace($BackendMode)) {
    $env:CF_BACKEND_MODE = $BackendMode
  }
  if ([string]::IsNullOrWhiteSpace($env:CF_BACKEND_MODE)) {
    $env:CF_BACKEND_MODE = "worker"
  }
  Add-CheckResult -Status "PASS" -Item "Env:CF_BACKEND_MODE" -Detail $env:CF_BACKEND_MODE

  $requiredEnv = @(
    "CF_FRONTEND_PROJECT",
    "CF_ADMIN_PROJECT",
    "PUBLIC_API_BASE",
    "ADMIN_API_BASE"
  )

  if (-not $SkipBackend) {
    $requiredEnv += @(
      "CORS_ORIGIN",
      "DB_HOST",
      "DB_PORT",
      "DB_USERNAME",
      "DB_DATABASE",
      "JWT_SECRET"
    )
  }

  foreach ($name in $requiredEnv) {
    $value = Get-EnvValue -Name $name
    if ([string]::IsNullOrWhiteSpace($value)) {
      Add-CheckResult -Status "FAIL" -Item "Env:$name" -Detail "Missing or empty"
    } else {
      Add-CheckResult -Status "PASS" -Item "Env:$name" -Detail "Set"
    }
  }

  $cfAccountId = Get-EnvValue -Name "CLOUDFLARE_ACCOUNT_ID"
  $cfApiToken = Get-EnvValue -Name "CLOUDFLARE_API_TOKEN"
  $hasAccountId = -not [string]::IsNullOrWhiteSpace($cfAccountId)
  $hasApiToken = -not [string]::IsNullOrWhiteSpace($cfApiToken)

  if ($hasAccountId -xor $hasApiToken) {
    Add-CheckResult -Status "FAIL" -Item "Cloudflare auth mode" -Detail "Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN together, or leave both empty"
  } elseif ($hasAccountId -and $hasApiToken) {
    Add-CheckResult -Status "PASS" -Item "Cloudflare auth mode" -Detail "Using API token + account ID from env"
  } else {
    $whoamiResult = Invoke-NativeCapture -Exe "npx" -CommandArgs @("wrangler", "whoami")
    $whoamiText = ($whoamiResult.Output -join "`n")
    $whoamiAuthenticated = $whoamiResult.ExitCode -eq 0 -and -not ($whoamiText -match "not authenticated|Not logged in")

    if ($whoamiAuthenticated) {
      Add-CheckResult -Status "PASS" -Item "Cloudflare auth mode" -Detail "Using Wrangler login session"
    } else {
      Add-CheckResult -Status "FAIL" -Item "Cloudflare auth mode" -Detail "Set API token envs or run npx wrangler login"
    }
  }

  $publicApiBase = Get-EnvValue -Name "PUBLIC_API_BASE"
  $adminApiBase = Get-EnvValue -Name "ADMIN_API_BASE"
  $corsOrigin = Get-EnvValue -Name "CORS_ORIGIN"

  foreach ($pair in @(
    @{ Name = "PUBLIC_API_BASE"; Value = $publicApiBase },
    @{ Name = "ADMIN_API_BASE"; Value = $adminApiBase }
  )) {
    if ($pair.Value -match "<your-subdomain>" -or $pair.Value -match "example\\.com") {
      Add-CheckResult -Status "WARN" -Item "Env:$($pair.Name)" -Detail "Looks like a placeholder value"
    }
  }

  if ($corsOrigin -match "example\\.com") {
    Add-CheckResult -Status "WARN" -Item "Env:CORS_ORIGIN" -Detail "Looks like placeholder domain(s)"
  }
}

$adminUploadUsages = Get-ChildItem -Path (Join-Path $RepoRoot "backend-admin\src") -Recurse -File -Include *.ts,*.vue |
  Select-String -Pattern "/upload" -SimpleMatch -ErrorAction SilentlyContinue
$backendUploadEndpoints = Get-ChildItem -Path (Join-Path $RepoRoot "backend\src") -Recurse -File -Include *.ts |
  Select-String -Pattern '@Controller\("upload"\)|@Post\("upload"\)|@Put\("upload"\)|@Patch\("upload"\)' -ErrorAction SilentlyContinue

if ($adminUploadUsages -and -not $backendUploadEndpoints) {
  Add-CheckResult -Status "WARN" -Item "Upload API parity" -Detail "Admin calls /upload but backend has no upload controller/route"
} else {
  Add-CheckResult -Status "PASS" -Item "Upload API parity" -Detail "No obvious upload mismatch detected"
}

if (-not $SkipBackend) {
  $backupFsUsage = Get-ChildItem -Path (Join-Path $RepoRoot "backend\src\modules\backup") -Recurse -File -Include *.ts -ErrorAction SilentlyContinue |
    Select-String -Pattern "fs\." -ErrorAction SilentlyContinue
  if ($backupFsUsage) {
    $storageDetail = if ($backendMode -eq "container") {
      "containers are not persistent storage"
    } else {
      "workers runtime local filesystem is ephemeral"
    }
    Add-CheckResult -Status "WARN" -Item "Backup persistence" -Detail "Backup module uses local filesystem; $storageDetail"
  } else {
    Add-CheckResult -Status "PASS" -Item "Backup persistence" -Detail "No local filesystem backup usage found"
  }
}

$passCount = @($results | Where-Object { $_.Status -eq "PASS" }).Count
$warnCount = @($results | Where-Object { $_.Status -eq "WARN" }).Count
$failCount = @($results | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host ""
$results | Sort-Object Status, Item | Format-Table -AutoSize
Write-Host ""
Write-Host "Summary: PASS=$passCount WARN=$warnCount FAIL=$failCount"

if ($failCount -gt 0) {
  exit 1
}
