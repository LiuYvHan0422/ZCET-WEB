# Repository Guidelines

## Project Structure & Module Organization
- `frontend/`: Nuxt 3 public site (pages, layouts, components, composables, Pinia stores, CSS assets).
- `backend/`: NestJS API (`src/modules/*` by domain, plus `src/common` and `src/config`).
- `backend-admin/`: Vue 3 + Vite admin UI (`src/pages`, `src/components`, `src/composables`, `src/stores`).
- Root contains static HTML reference pages (for visual/prototype comparison), `doc/`, and `.guize/`.

Use domain-first organization in backend (for example: `modules/products`, `modules/news`) and keep API, DTOs, services, and entities grouped per module.

## Build, Test, and Development Commands
- Frontend:
  - `cd frontend && npm install`
  - `npm run dev` (local dev server)
  - `npm run build` (production build)
  - `npm run preview` (preview production output)
- Backend:
  - `cd backend && npm install`
  - `npm run start:dev` (watch mode)
  - `npm run build && npm run start:prod`
  - `npm run lint`, `npm run format`, `npm test`
- Admin:
  - `cd backend-admin && npm install`
  - `npm run dev`, `npm run build`, `npm run preview`

## Coding Style & Naming Conventions
- TypeScript across all subprojects; use 2-space indentation and consistent semicolon usage.
- Vue components: `PascalCase.vue` (for example `AdminHeader.vue`).
- Composables: `useX.ts` pattern (for example `useApi.ts`, `useAuth.ts`).
- NestJS: `*.controller.ts`, `*.service.ts`, `*.module.ts`, DTOs ending in `Dto`, entities in `entities/*.entity.ts`.
- Backend linting/formatting is standardized with ESLint + Prettier (`backend/package.json` scripts).

## Testing Guidelines
- Backend uses Jest (`*.spec.ts`, configured in `backend/package.json`).
- Current repository state has no committed test files; add tests with every backend feature change.
- Minimum expectation for new API behavior: success path, validation failure, and auth/permission failure.
- Run `cd backend && npm test` before opening a PR.

## Commit & Pull Request Guidelines
- Git history is not available in this workspace export; follow Conventional Commits:
  - `feat(backend): ...`, `fix(frontend): ...`, `refactor(admin): ...`, `docs: ...`
- PRs should include:
  - concise summary and impacted paths
  - API contract changes (request/response fields)
  - manual verification steps
  - screenshots for UI changes (`frontend/` or `backend-admin/`)
  - environment/config changes

## Security & Configuration Tips
- Never commit real secrets in code or docs; use environment variables.
- Override DB/JWT defaults via `.env` in deployment.
- Recheck production-safe settings before release (CORS policy, `synchronize`, dev-only auth endpoints).
