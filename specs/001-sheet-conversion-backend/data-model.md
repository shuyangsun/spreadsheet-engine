# Data Model: Excel-to-Google Sheet Conversion Backend (Production)

## Entity Overview

| Entity                         | Purpose                                                                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `ConversionRequest`            | Tracks each Excel upload converted into a Google Sheet, including requester identity, source metadata, resulting sheet identifiers, and status. |
| `MappingExecution`             | Records every mapping evaluation run against a Google Sheet, including mapping snapshot, inputs, outputs, and execution outcome.                |
| `MappingConfigurationSnapshot` | Stores the exact mapping JSON used for a conversion or execution to ensure reproducibility and auditability.                                    |
| `ApiClient`                    | Represents an authorized internal client (service) allowed to invoke the APIs; captures authentication metadata and quotas.                     |

## Detailed Definitions

### ConversionRequest

- **Primary Key**: `id` (UUID)
- **Attributes**:
  - `clientId` (FK → `ApiClient.id`)
  - `sourceFileName` (string)
  - `sourceFileSizeBytes` (integer)
  - `worksheetCount` (integer)
  - `googleSheetId` (string, nullable until success)
  - `googleSheetLink` (string, nullable until success)
  - `driveFolderId` (string)
  - `status` (enum: `PENDING`, `SUCCEEDED`, `FAILED`)
  - `failureCategory` (enum: `VALIDATION`, `AUTH`, `QUOTA`, `TRANSIENT`, nullable)
  - `failureDetail` (text, nullable)
  - `checksumSha256` (string)
  - `createdAt` (timestamp)
  - `completedAt` (timestamp, nullable)
- **Indexes**: `(googleSheetId)`, `(clientId, createdAt DESC)`, `(status, createdAt DESC)`
- **Relationships**: One `ConversionRequest` may reference many `MappingExecution` records (via `googleSheetId`).
- **Validation Rules**:
  - `sourceFileSizeBytes` must be ≤ 10 MiB.
  - `worksheetCount` must be ≥1.
  - `status` transitions allowed: `PENDING → SUCCEEDED/FAILED`; no transitions after terminal state without manual override.

### MappingExecution

- **Primary Key**: `id` (UUID)
- **Attributes**:
  - `clientId` (FK → `ApiClient.id`)
  - `googleSheetId` (string)
  - `conversionRequestId` (FK → `ConversionRequest.id`, nullable—execution may run on pre-existing sheet)
  - `mappingSnapshotId` (FK → `MappingConfigurationSnapshot.id`)
  - `inputParameters` (JSONB)
  - `outputParameters` (JSONB, nullable until completion)
  - `warnings` (JSONB array of strings)
  - `status` (enum: `PENDING`, `SUCCEEDED`, `FAILED`)
  - `failureCategory` (enum: `VALIDATION`, `AUTH`, `QUOTA`, `TRANSIENT`, nullable)
  - `failureDetail` (text, nullable)
  - `executionDurationMs` (integer, nullable)
  - `createdAt` (timestamp)
  - `completedAt` (timestamp, nullable)
- **Indexes**: `(googleSheetId, createdAt DESC)`, `(clientId, createdAt DESC)`, `(status, createdAt DESC)`
- **Validation Rules**:
  - `inputParameters` must satisfy the schema defined in the mapping snapshot.
  - `executionDurationMs` recorded only when status is `SUCCEEDED`.
  - Failure category required when status is `FAILED`.

### MappingConfigurationSnapshot

- **Primary Key**: `id` (UUID)
- **Attributes**:
  - `fingerprint` (string hash of canonical JSON) — unique index
  - `rawConfig` (JSONB)
  - `schemaVersion` (string)
  - `createdAt` (timestamp)
- **Relationships**: Referenced by both `ConversionRequest` (optional) and `MappingExecution` (required) to guarantee the mapping used for evaluation.
- **Validation Rules**:
  - `rawConfig` must validate against `src/shared/configuration/configuration.schema.json` before persistence.
  - `schemaVersion` derived from the shared configuration package version.

### ApiClient

- **Primary Key**: `id` (UUID)
- **Attributes**:
  - `name` (string)
  - `description` (string)
  - `allowedScopes` (JSONB array of enumerated scopes, e.g., `CONVERSION_UPLOAD`, `MAPPING_EXECUTE`)
  - `rateLimitPerMinute` (integer)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)
- **Validation Rules**:
  - Each API request must map to an active `ApiClient` with remaining quota.
  - `rateLimitPerMinute` defaults to 60 if unspecified.

## Relationships

- `ApiClient 1 — * ConversionRequest`
- `ApiClient 1 — * MappingExecution`
- `ConversionRequest 1 — * MappingExecution` (logical association through `googleSheetId` or `conversionRequestId`)
- `MappingConfigurationSnapshot 1 — * MappingExecution`

## Derived Views

- **Sheet Activity View**: Materialized SQL view summarizing latest conversion + execution per `googleSheetId` for operator dashboards.
- **Client Volume View**: Aggregates counts of conversions/executions per client per day for quota monitoring.

## Data Lifecycle

- Records retained for at least 30 days to satisfy audit access window.
- Scheduled job (future scope) can archive records older than 180 days to cold storage while keeping aggregates.

## Identity & Integrity Rules

- All primary keys generated server-side via UUID v7 for ordered inserts.
- `fingerprint` ensures mapping snapshots are deduplicated; reuse existing snapshot when hash matches incoming mapping JSON.
- Foreign keys enforce cascade delete prevention; manual cleanup required if an `ApiClient` is decommissioned.
