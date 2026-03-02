# ZCET-WEB

## Deploy Backend (Render Blueprint)

Use this link to create the backend service from `render.yaml`:

- https://dashboard.render.com/blueprint/new?repo=https://github.com/LiuYvHan0422/ZCET-WEB

After opening the link:

1. Connect GitHub to Render (first time only).
2. Select branch `main`.
3. Create Blueprint resources.
4. Set required backend env vars:
   - `JWT_SECRET`
   - `JWT_EXPIRATION`
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_DATABASE`
   - `API_PREFIX=api/v1`
   - `DB_SYNCHRONIZE=false`
   - `DB_MIGRATIONS_RUN=false`
   - `DB_LOGGING=false`
   - `CORS_ORIGIN=https://www.liuyuhan.top,https://www.admin.liuyuhan.top,https://admin.liuyuhan.top`

When deployment is live, map `api.liuyuhan.top` CNAME to the Render service domain.
