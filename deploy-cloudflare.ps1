param(
  [string]$EnvFile = ".\deploy\cloudflare.env"
)

& powershell -ExecutionPolicy Bypass -File ".\deploy\deploy-cloudflare.ps1" -EnvFile $EnvFile
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
