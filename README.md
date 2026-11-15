# expense-tracker-api

Hono API: Drizzle (Neon), Zod OpenAPI, Better Auth. Deployed on Cloudflare Workers; runtime config comes from `c.env`.

## Setup

```sh
pnpm install
cp .env-example .env   # fill DATABASE_URL and BETTER_AUTH_SECRET (≥ 32 chars)
pnpm db:migrate
pnpm dev               # http://localhost:8787
```

- API reference: `/scalar` (gated in production unless `ENABLE_API_DOCS=true`)
- OpenAPI: `/docs`
- Health: `/health`

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` | `wrangler dev` |
| `deploy` | Deploy to Cloudflare |
| `test` / `test:watch` | Vitest (HTTP integration + unit). Uses `DATABASE_URL_TEST` or falls back to `DATABASE_URL` |
| `db:generate` / `db:migrate` / `db:studio` | Drizzle migrations / studio |
| `typecheck` | `tsc --noEmit` |
| `check` / `check:fix` | Biome |

## Tests

Integration tests hit a real Neon database and create disposable users (`*@expense-tracker.test`).

```sh
# optional dedicated DB (recommended)
# DATABASE_URL_TEST=postgres://...

pnpm test
pnpm test:watch
```

Email sending is skipped when `RESEND_API_KEY` is unset (reset links are logged).

## Environment

| Name | Description |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `DATABASE_URL_TEST` | Optional DB for Vitest (falls back to `DATABASE_URL`) |
| `BETTER_AUTH_SECRET` | ≥ 32 characters |
| `BETTER_AUTH_URL` | Public API URL |
| `BETTER_AUTH_TRUSTED_ORIGIN` | Frontend origin (CORS + Better Auth) |
| `ENVIRONMENT` | `development` \| `production` |
| `ENABLE_API_DOCS` | `true` \| `false` |
| `RESEND_API_KEY` | Optional; without it password-reset emails are logged |
| `EMAIL_FROM` | Optional sender |
| `LOG_LEVEL` | Pino level |
