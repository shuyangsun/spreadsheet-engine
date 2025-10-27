# Quickstart: Excel-to-Google Sheet Conversion Backend (Production)

## Prerequisites

- Node.js 20 LTS and pnpm 9 installed locally.
- Cloudflare Wrangler 3.0+ with access to the production Workers account.
- PostgreSQL database URL, accessible through `pgBouncer` (for audit persistence).
- Google Cloud project configured with Drive and Sheets APIs enabled, plus a service account with permission to create files in the target Drive folder.
- Admin portal mapping schemas available via `src/shared/configuration` package.

## Environment Setup

1. Copy `.env.example` to `.env` within `src/production/backend/sheet-conversion/` and provide:
   - `DATABASE_URL` (PostgreSQL connection string through pgBouncer)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_KEY` (JSON, base64 encoded)
   - `GOOGLE_DRIVE_DEFAULT_FOLDER_ID`
   - `JWT_ISSUER` / `JWT_AUDIENCE` (for internal auth validation)
2. From repository root, install dependencies:

   ```bash
   pnpm install
   ```

3. Generate Prisma client and apply migrations:

   ```bash
   pnpm --filter sheet-conversion-backend prisma migrate deploy
   ```

4. Build the Worker bundle with Node compatibility:

   ```bash
   pnpm --filter sheet-conversion-backend build
   ```

## Local Development

1. Start the Worker locally with file watch and Miniflare:

   ```bash
   pnpm --filter sheet-conversion-backend dev
   ```

2. Upload API (conversion):

   ```bash
   curl -X POST http://127.0.0.1:8787/conversion/upload \
     -H "Authorization: Bearer <internal-token>" \
     -F "file=@./fixtures/sample.xlsx" \
     -F "targetDriveFolderId=$GOOGLE_DRIVE_DEFAULT_FOLDER_ID"
   ```

3. Mapping API (execute):

   ```bash
   curl -X POST http://127.0.0.1:8787/mapping/execute \
     -H "Authorization: Bearer <internal-token>" \
     -H "Content-Type: application/json" \
     -d @./fixtures/sample-execution.json
   ```

4. View audit records via SQL (example):

   ```sql
   SELECT * FROM conversion_requests ORDER BY created_at DESC LIMIT 20;
   ```

## Deployment

1. Authenticate Wrangler with the target Cloudflare account:

   ```bash
   wrangler login
   ```

2. Publish to staging:

   ```bash
   pnpm --filter sheet-conversion-backend deploy:staging
   ```

3. Promote to production after verification:

   ```bash
   pnpm --filter sheet-conversion-backend deploy:prod
   ```

## Operational Notes

- Enable `nodejs_compat` in `wrangler.toml` to run Express on Workers.
- Monitor quota headers from Google APIs; alerts should trigger when success rate drops below success criteria thresholds.
- Rotate service account keys regularly and store secrets in the platform secret manager.
- Follow constitution: no automated tests unless explicitly required; rely on manual smoke scripts during deployment.
