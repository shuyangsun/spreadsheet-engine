# Research: Excel-to-Google Sheet Conversion Backend (Production)

## Task 1: Excel → Google Sheet Conversion Path

- **Decision**: Use Google Drive API `files.create` with `mimeType` `application/vnd.google-apps.spreadsheet` and the source Excel file streamed as multipart media to create the Google Sheet in a governed Drive folder; capture the returned `id` and `webViewLink`.
- **Rationale**: Drive handles on-the-fly conversion from XLSX to Google Sheets, automatically preserving worksheets and formatting while returning shareable links; this keeps the workflow in a single request, avoids manual XLSX parsing, and supports placing the file in a specific Drive folder owned by the service account.
- **Alternatives considered**: Google Sheets API `spreadsheets.create` followed by manual cell population (rejected—requires custom XLSX parsing, increases complexity); Google Apps Script (rejected—introduces separate runtime and slower execution, harder to operate from backend).

## Task 2: Express Runtime on Cloudflare Workers

- **Decision**: Target Cloudflare Workers with the Node.js compatibility flag enabled (`compatibility_flags = ["nodejs_compat"]`) and use the standard Express 5 runtime bundled with Wrangler to deploy the API as a single Worker.
- **Rationale**: As of 2025, Cloudflare Workers supports most Node.js core modules through Node compatibility, allowing Express to run without third-party shims while keeping deployment within constitution guidelines; Wrangler handles bundling and streaming request bodies for uploads.
- **Alternatives considered**: Cloud Run / GKE (rejected—violates deployment guideline favoring Cloudflare Workers); Rewriting to Hono or itty-router (rejected—user explicitly mandated Express and APIs remain separable within Express routing).

## Task 3: Audit Persistence Strategy

- **Decision**: Persist conversion and execution records in PostgreSQL 15 using Prisma as the ORM, hosted via the existing platform PostgreSQL cluster and accessed through pooled connections with `pgBouncer`.
- **Rationale**: PostgreSQL offers structured querying needed for operator filters (date range, client, status, sheet ID) with reliable transactional semantics; Prisma provides a type-safe TypeScript client and schema migrations, aligning with existing Node 20 toolchains.
- **Alternatives considered**: Google BigQuery (rejected—optimized for analytics, slower for low-latency lookups); Firestore (rejected—NoSQL structure complicates complex filtering and range queries); Logging-only (rejected—operators require structured historical queries).

## Task 4: Mapping Execution Mechanics

- **Decision**: Validate incoming mapping JSON against `src/shared/configuration/configuration.schema.json`, then resolve sheet ranges via Google Sheets API `spreadsheets.values.batchGet` and apply the shared `transforms` helpers to compute output parameters.
- **Rationale**: Reusing the shared configuration schema guarantees alignment with the admin portal authoring flow, while batch fetching reduces round-trips; using existing transforms minimizes duplicate logic and concentrates mapping rules in one place.
- **Alternatives considered**: Custom validator (rejected—duplicated maintenance); Executing formulas within Google Sheets (rejected—difficult to control evaluation timing and to return structured outputs).

## Task 5: Google API Resilience & Quotas

- **Decision**: Wrap drive/sheets calls with exponential backoff (`p-retry` + `googleapis` built-in retry config) respecting quota headers, log correlation IDs, and surface categorized errors (auth/quota/validation/transient) in API responses.
- **Rationale**: Google Drive/Sheets enforce per-minute and per-day quotas; structured retry with jitter reduces repeated throttling, while categorized errors align with functional requirements for actionable responses.
- **Alternatives considered**: No retry logic (rejected—risks frequent failures under transient quota spikes); Custom queueing layer (rejected for initial scope—adds operational overhead without clear need).
