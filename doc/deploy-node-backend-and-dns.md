# Deploy Backend On Node Platform + Cloudflare DNS

## Goal

- Keep `frontend` and `backend-admin` on Cloudflare Pages.
- Move `backend` to a Node runtime platform (Railway or Render), not Cloudflare Worker mode.
- Keep public API domain as `api.liuyuhan.top`.

## 1. Deploy backend (choose one)

### Option A: Railway

1. In Railway, create a new project from this repo.
2. Set service root directory to `backend`.
3. Railway will use `backend/railway.json`:
   - build: Nixpacks
   - start: `npm run start:prod`
4. Add env vars from `backend/.env.example`:
   - Required: `JWT_SECRET`, `JWT_EXPIRATION`
   - Required DB: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
   - Recommended: `NODE_ENV=production`, `API_PREFIX=api/v1`, `DB_SYNCHRONIZE=false`, `DB_LOGGING=false`
5. Deploy and verify:
   - `https://<railway-domain>/api/v1/healthz` returns 200 JSON.

### Option B: Render

1. In Render, create Blueprint deployment from this repo (uses root `render.yaml`).
2. Render creates `webv1-api` service with root `backend`.
3. In service env vars, add:
   - `JWT_SECRET`, `JWT_EXPIRATION`
   - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
   - `API_PREFIX=api/v1`, `DB_SYNCHRONIZE=false`, `DB_LOGGING=false`
4. Deploy and verify:
   - `https://<render-domain>/api/v1/healthz` returns 200 JSON.

## 2. Cloudflare DNS setup

### `admin.liuyuhan.top` (fix NXDOMAIN)

Create DNS record in Cloudflare Zone `liuyuhan.top`:

- Type: `CNAME`
- Name: `admin`
- Target: `webv1-admin.pages.dev`
- Proxy: `Proxied` (orange cloud)

Then check Pages custom domain for project `webv1-admin` becomes `active`.

### `api.liuyuhan.top` (switch to Node backend)

After Node backend is live:

- Type: `CNAME`
- Name: `api`
- Target: `<your-backend-domain>` (for example `xxx.up.railway.app` or `xxx.onrender.com`)
- Proxy: `Proxied` (orange cloud)

## 3. Frontend/admin build env

- `backend-admin/.env.production.example`:
  - `VITE_API_BASE_URL=https://api.liuyuhan.top/api/v1`
- `frontend/.env.production.example`:
  - `API_BASE=https://api.liuyuhan.top/api/v1`

Set same env vars in Cloudflare Pages project settings before next deployment.

## 4. Verification checklist

1. `https://admin.liuyuhan.top/login` opens normally (no NXDOMAIN).
2. `https://api.liuyuhan.top/api/v1/healthz` returns 200.
3. `https://www.admin.liuyuhan.top/login` login succeeds.
4. `https://www.liuyuhan.top` loads and data APIs succeed.
