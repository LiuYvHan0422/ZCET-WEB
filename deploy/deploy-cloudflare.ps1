param(
  [string]$EnvFile = (Join-Path $PSScriptRoot "cloudflare.env"),
  [switch]$SkipBackend,
  [ValidateSet("worker", "container")]
  [string]$BackendMode = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Import-EnvFile {
  param([string]$Path)

  if (-not (Test-Path -Path $Path)) {
    throw "Env file not found: $Path"
  }

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

function Require-Env {
  param([string]$Name)

  $item = Get-Item -Path "Env:$Name" -ErrorAction SilentlyContinue
  $value = if ($null -eq $item) { "" } else { $item.Value }
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Required env missing: $Name"
  }
}

function Get-EnvValue {
  param([string]$Name)

  $item = Get-Item -Path "Env:$Name" -ErrorAction SilentlyContinue
  if ($null -eq $item) {
    return $null
  }

  return $item.Value
}

function Ensure-Command {
  param([string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Command not found in PATH: $Name"
  }
}

function Resolve-DockerCommand {
  $dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
  if ($dockerCommand) {
    return $dockerCommand.Source
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
      Write-Host "Using docker from: $candidate" -ForegroundColor Yellow
      return $candidate
    }
  }

  throw "Command not found in PATH: docker"
}

function Invoke-External {
  param(
    [string]$Exe,
    [string[]]$CommandArgs,
    [string]$WorkingDir
  )

  Push-Location $WorkingDir
  try {
    Write-Host ">> $Exe $($CommandArgs -join ' ')" -ForegroundColor Cyan
    & $Exe @CommandArgs
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed with exit code ${LASTEXITCODE}: $Exe $($CommandArgs -join ' ')"
    }
  }
  finally {
    Pop-Location
  }
}

function Invoke-ExternalCapture {
  param(
    [string]$Exe,
    [string[]]$CommandArgs,
    [string]$WorkingDir
  )

  Push-Location $WorkingDir
  try {
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
      $output = & $Exe @CommandArgs 2>&1
    }
    finally {
      $ErrorActionPreference = $previousErrorActionPreference
    }

    $exitCode = $LASTEXITCODE
    return [PSCustomObject]@{
      Output = @($output)
      ExitCode = $exitCode
    }
  }
  finally {
    Pop-Location
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

function Ensure-PagesProject {
  param(
    [string]$ProjectName,
    [string]$Branch
  )

  $createResult = Invoke-ExternalCapture -Exe "npx" -CommandArgs @(
    "wrangler", "pages", "project", "create", $ProjectName, "--production-branch", $Branch
  ) -WorkingDir $RepoRoot

  if ($createResult.ExitCode -eq 0) {
    Write-Host "Created Pages project: $ProjectName" -ForegroundColor Green
    return
  }

  $outputText = ($createResult.Output -join "`n")
  if ($outputText -match "already exists|A project with this name already exists") {
    Write-Host "Pages project already exists: $ProjectName" -ForegroundColor Yellow
    return
  }

  Write-Host "Warning: unable to pre-create Pages project $ProjectName. Will continue and rely on pages deploy." -ForegroundColor Yellow
  if (-not [string]::IsNullOrWhiteSpace($outputText)) {
    Write-Host $outputText
  }
}

Import-EnvFile -Path $EnvFile

if ([string]::IsNullOrWhiteSpace($env:CF_FRONTEND_BRANCH)) { $env:CF_FRONTEND_BRANCH = "main" }
if ([string]::IsNullOrWhiteSpace($env:CF_ADMIN_BRANCH)) { $env:CF_ADMIN_BRANCH = "main" }
if ([string]::IsNullOrWhiteSpace($env:CF_API_WORKER_NAME)) { $env:CF_API_WORKER_NAME = "webv1-api" }
if ([string]::IsNullOrWhiteSpace($env:CF_BACKEND_MODE)) { $env:CF_BACKEND_MODE = "worker" }
if ([string]::IsNullOrWhiteSpace($env:API_PREFIX)) { $env:API_PREFIX = "api/v1" }
if ([string]::IsNullOrWhiteSpace($env:DB_SYNCHRONIZE)) { $env:DB_SYNCHRONIZE = "false" }
if ([string]::IsNullOrWhiteSpace($env:DB_MIGRATIONS_RUN)) { $env:DB_MIGRATIONS_RUN = "false" }
if ([string]::IsNullOrWhiteSpace($env:DB_LOGGING)) { $env:DB_LOGGING = "false" }
if ([string]::IsNullOrWhiteSpace($env:JWT_EXPIRATION)) { $env:JWT_EXPIRATION = "7d" }
if ([string]::IsNullOrWhiteSpace($env:ENABLE_DEV_LOGIN)) { $env:ENABLE_DEV_LOGIN = "false" }
if ([string]::IsNullOrWhiteSpace($env:DEV_LOGIN_USERNAME)) { $env:DEV_LOGIN_USERNAME = "admin" }
if ([string]::IsNullOrWhiteSpace($env:SEED_ADMIN_USERNAME)) { $env:SEED_ADMIN_USERNAME = "admin" }

if (-not [string]::IsNullOrWhiteSpace($BackendMode)) {
  $env:CF_BACKEND_MODE = $BackendMode
}

$backendMode = $env:CF_BACKEND_MODE.Trim().ToLowerInvariant()
if ($backendMode -notin @("worker", "container")) {
  throw "Invalid backend mode: $backendMode. Allowed values: worker, container."
}

Require-Env -Name "CF_FRONTEND_PROJECT"
Require-Env -Name "CF_ADMIN_PROJECT"
Require-Env -Name "PUBLIC_API_BASE"
Require-Env -Name "ADMIN_API_BASE"

if (-not $SkipBackend) {
  Require-Env -Name "CORS_ORIGIN"
  Require-Env -Name "DB_HOST"
  Require-Env -Name "DB_PORT"
  Require-Env -Name "DB_USERNAME"
  Require-Env -Name "DB_DATABASE"
  Require-Env -Name "JWT_SECRET"
}

$frontendDir = Join-Path $RepoRoot "frontend"
$adminDir = Join-Path $RepoRoot "backend-admin"
$backendDir = Join-Path $RepoRoot "backend"
$backendWranglerConfig = if ($backendMode -eq "container") { "wrangler.containers.toml" } else { "wrangler.toml" }
$backendWranglerConfigPath = Join-Path $backendDir $backendWranglerConfig

if (-not $SkipBackend -and -not (Test-Path -Path $backendWranglerConfigPath -PathType Leaf)) {
  throw "Backend wrangler config not found: $backendWranglerConfigPath"
}

Ensure-Command -Name "npm"
Ensure-Command -Name "npx"

if (-not $SkipBackend -and $backendMode -eq "container") {
  $dockerExe = Resolve-DockerCommand
  $dockerInfoResult = Invoke-ExternalCapture -Exe $dockerExe -CommandArgs @("info") -WorkingDir $RepoRoot
  if ($dockerInfoResult.ExitCode -ne 0) {
    $dockerDetail = Get-FirstUsefulLine -Lines $dockerInfoResult.Output
    if (-not $dockerDetail) {
      $dockerDetail = "docker info failed. Start Docker Desktop (or daemon) before deploying backend."
    }
    throw "Docker daemon is not ready: $dockerDetail"
  }
}

$cfAccountId = Get-EnvValue -Name "CLOUDFLARE_ACCOUNT_ID"
$cfApiToken = Get-EnvValue -Name "CLOUDFLARE_API_TOKEN"
$hasAccountId = -not [string]::IsNullOrWhiteSpace($cfAccountId)
$hasApiToken = -not [string]::IsNullOrWhiteSpace($cfApiToken)

if ($hasAccountId -xor $hasApiToken) {
  throw "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set together, or both left empty."
}

if ($hasAccountId -and $hasApiToken) {
  Write-Host "Using Cloudflare API token auth from env." -ForegroundColor Green
} else {
  Write-Host "CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN not set, falling back to Wrangler login session." -ForegroundColor Yellow
}

Write-Host "Verifying Cloudflare auth..." -ForegroundColor Green
$whoamiResult = Invoke-ExternalCapture -Exe "npx" -CommandArgs @("wrangler", "whoami") -WorkingDir $RepoRoot
$whoamiText = ($whoamiResult.Output -join "`n")
if ($whoamiResult.ExitCode -ne 0 -or $whoamiText -match "not authenticated|Not logged in") {
  throw "Cloudflare auth is not ready. Set CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN or run npx wrangler login."
}
Write-Host $whoamiText

Ensure-PagesProject -ProjectName $env:CF_FRONTEND_PROJECT -Branch $env:CF_FRONTEND_BRANCH
Ensure-PagesProject -ProjectName $env:CF_ADMIN_PROJECT -Branch $env:CF_ADMIN_BRANCH

Write-Host "Deploying frontend (Nuxt static)..." -ForegroundColor Green
$oldApiBase = Get-EnvValue -Name "API_BASE"
$env:API_BASE = $env:PUBLIC_API_BASE
try {
  try {
    Invoke-External -Exe "npm" -CommandArgs @("ci") -WorkingDir $frontendDir
  } catch {
    Write-Host "frontend npm ci failed, fallback to npm install..." -ForegroundColor Yellow
    Invoke-External -Exe "npm" -CommandArgs @("install") -WorkingDir $frontendDir
  }
  Invoke-External -Exe "npm" -CommandArgs @("run", "generate") -WorkingDir $frontendDir
  Invoke-External -Exe "npx" -CommandArgs @(
    "wrangler", "pages", "deploy", ".output/public",
    "--project-name", $env:CF_FRONTEND_PROJECT,
    "--branch", $env:CF_FRONTEND_BRANCH
  ) -WorkingDir $frontendDir
}
finally {
  if ($null -eq $oldApiBase) {
    Remove-Item -Path Env:API_BASE -ErrorAction SilentlyContinue
  } else {
    $env:API_BASE = $oldApiBase
  }
}

Write-Host "Deploying admin (Vite)..." -ForegroundColor Green
$oldAdminApi = Get-EnvValue -Name "VITE_API_BASE_URL"
$env:VITE_API_BASE_URL = $env:ADMIN_API_BASE
try {
  try {
    Invoke-External -Exe "npm" -CommandArgs @("ci") -WorkingDir $adminDir
  } catch {
    Write-Host "admin npm ci failed, fallback to npm install..." -ForegroundColor Yellow
    Invoke-External -Exe "npm" -CommandArgs @("install") -WorkingDir $adminDir
  }
  Invoke-External -Exe "npm" -CommandArgs @("run", "build") -WorkingDir $adminDir
  Invoke-External -Exe "npx" -CommandArgs @(
    "wrangler", "pages", "deploy", "dist",
    "--project-name", $env:CF_ADMIN_PROJECT,
    "--branch", $env:CF_ADMIN_BRANCH
  ) -WorkingDir $adminDir
}
finally {
  if ($null -eq $oldAdminApi) {
    Remove-Item -Path Env:VITE_API_BASE_URL -ErrorAction SilentlyContinue
  } else {
    $env:VITE_API_BASE_URL = $oldAdminApi
  }
}

if (-not $SkipBackend) {
  Write-Host "Deploying backend ($backendMode mode)..." -ForegroundColor Green
  try {
    Invoke-External -Exe "npm" -CommandArgs @("ci") -WorkingDir $backendDir
  } catch {
    Write-Host "backend npm ci failed, fallback to npm install..." -ForegroundColor Yellow
    Invoke-External -Exe "npm" -CommandArgs @("install") -WorkingDir $backendDir
  }

  $secretFile = Join-Path $backendDir ".cf-secrets.json"
  $secretInputs = [ordered]@{
    API_PREFIX = $env:API_PREFIX
    CORS_ORIGIN = $env:CORS_ORIGIN
    DB_HOST = $env:DB_HOST
    DB_PORT = $env:DB_PORT
    DB_USERNAME = $env:DB_USERNAME
    DB_PASSWORD = $env:DB_PASSWORD
    DB_DATABASE = $env:DB_DATABASE
    DB_SYNCHRONIZE = $env:DB_SYNCHRONIZE
    DB_MIGRATIONS_RUN = $env:DB_MIGRATIONS_RUN
    DB_LOGGING = $env:DB_LOGGING
    JWT_SECRET = $env:JWT_SECRET
    JWT_EXPIRATION = $env:JWT_EXPIRATION
    ENABLE_DEV_LOGIN = $env:ENABLE_DEV_LOGIN
    DEV_LOGIN_USERNAME = $env:DEV_LOGIN_USERNAME
    SEED_ADMIN_USERNAME = $env:SEED_ADMIN_USERNAME
    SEED_ADMIN_PASSWORD = $env:SEED_ADMIN_PASSWORD
  }
  $secrets = [ordered]@{}
  foreach ($entry in $secretInputs.GetEnumerator()) {
    if ($null -eq $entry.Value) {
      continue
    }

    $value = [string]$entry.Value
    if ([string]::IsNullOrWhiteSpace($value)) {
      continue
    }

    $secrets[$entry.Key] = $value
  }

  $deployArgs = @(
    "wrangler", "deploy",
    "--config", $backendWranglerConfig,
    "--name", $env:CF_API_WORKER_NAME
  )

  if (-not [string]::IsNullOrWhiteSpace($env:CF_API_DOMAIN)) {
    $deployArgs += @("--domains", $env:CF_API_DOMAIN)
  }

  try {
    $secrets | ConvertTo-Json | Set-Content -Path $secretFile -Encoding UTF8

    Invoke-External -Exe "npx" -CommandArgs $deployArgs -WorkingDir $backendDir
    Invoke-External -Exe "npx" -CommandArgs @(
      "wrangler", "secret", "bulk", ".cf-secrets.json",
      "--config", $backendWranglerConfig,
      "--name", $env:CF_API_WORKER_NAME
    ) -WorkingDir $backendDir
  }
  finally {
    if (Test-Path -Path $secretFile) {
      Remove-Item -Path $secretFile -Force
    }
  }
}

Write-Host ""
Write-Host "Cloudflare deployment completed." -ForegroundColor Green
Write-Host "Frontend Pages project: $($env:CF_FRONTEND_PROJECT)"
Write-Host "Admin Pages project: $($env:CF_ADMIN_PROJECT)"
if (-not $SkipBackend) {
  Write-Host "Backend worker: $($env:CF_API_WORKER_NAME)"
  Write-Host "Backend mode: $backendMode"
  Write-Host "Backend config: $backendWranglerConfig"
} else {
  Write-Host "Backend deployment: skipped (-SkipBackend)"
}
