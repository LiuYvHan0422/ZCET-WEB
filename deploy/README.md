# Cloudflare One-Click Deployment

This project now supports one command deployment for:

- `frontend` (Nuxt static) -> Cloudflare Pages
- `backend-admin` (Vite SPA) -> Cloudflare Pages
- `backend` (NestJS) -> Cloudflare Workers (`worker` mode default, `container` mode optional)

## 0) Run readiness check (recommended)

Run the preflight checker before deployment:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\check-cloudflare-readiness.ps1
```

Use a custom env file if needed:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\check-cloudflare-readiness.ps1 -EnvFile .\deploy\cloudflare.env
```

Override backend mode for precheck:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\check-cloudflare-readiness.ps1 -BackendMode worker
```

The checker validates tooling, auth, required env variables, and known runtime gaps.
`docker` checks run only when backend mode is `container`.

Pages-only precheck (skip backend container requirements):

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\check-cloudflare-readiness.ps1 -SkipBackend
```

## 1) Prepare env file

Copy and edit:

```powershell
Copy-Item .\deploy\cloudflare.env.example .\deploy\cloudflare.env
```

Fill all required values in `deploy/cloudflare.env`.
For backend secrets, empty values are skipped automatically during `wrangler secret bulk` upload.

Backend mode:
- `CF_BACKEND_MODE=worker` (default, no local Docker required)
- `CF_BACKEND_MODE=container` (legacy containers mode, requires Docker)

Auth note:
- You can either set `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` in env file
- Or leave them empty and authenticate with `npx wrangler login`

## 2) Run deployment

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy-cloudflare.ps1
```

Force backend mode from command line (overrides env file):

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy-cloudflare.ps1 -BackendMode worker
powershell -ExecutionPolicy Bypass -File .\deploy\deploy-cloudflare.ps1 -BackendMode container
```

Pages-only deploy (skip backend worker/container):

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy-cloudflare.ps1 -SkipBackend
```

The script will:

1. Verify Cloudflare auth (`wrangler whoami`)
2. Create Pages projects if missing
3. Build + deploy `frontend`
4. Build + deploy `backend-admin`
5. Deploy backend in selected mode (`worker` or `container`)
6. Upload backend runtime secrets

## Manual Pages upload (no API token flow)

If you want to start with UI upload in Cloudflare Pages first:

1. Build assets:
```powershell
cd .\frontend
npm run generate
cd ..\backend-admin
npm run build
cd ..
```
2. Upload from directories:
- Frontend: `frontend/.output/public`
- Admin: `backend-admin/dist`

Prebuilt ZIP artifacts are also available in `deploy/artifacts`:
- `deploy/artifacts/frontend-pages.zip`
- `deploy/artifacts/admin-pages.zip`

## Notes

- Fixed/static assets are supported immediately.
- Admin-side image upload is still not implemented in backend API (`/upload` not present), so this flow is for fixed assets only.
- `backend-admin` and `frontend` include SPA/static fallback rules via `_redirects`.
- `docker` is required only when `CF_BACKEND_MODE=container`.

## Troubleshooting (Windows, container mode only)

- If `docker` is installed but not in PATH, deployment scripts auto-detect:
  - `C:\Program Files\Docker\Docker\resources\bin\docker.exe`
  - optional override via env: `DOCKER_PATH`

- If precheck/deploy shows Docker daemon `500` errors (for example `dockerDesktopWindowsEngine` or `dockerDesktopLinuxEngine`), run once with **Administrator PowerShell**:

```powershell
wsl --install
```

Then reboot Windows, open Docker Desktop once to finish initialization, and verify:

```powershell
docker desktop status
docker version
```

`docker version` must include a working `Server` section before backend deploy can pass.
