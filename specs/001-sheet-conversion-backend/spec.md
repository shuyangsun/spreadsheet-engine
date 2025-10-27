# Feature Specification: Excel-to-Google Sheet Conversion Backend (Production)

**Feature Branch**: `001-sheet-conversion-backend`
**Created**: 2025-10-26
**Status**: Draft
**Input**: User description: "specify the production version of the Excel to Google sheet conversion backend. There should be two APIs: 1. API to upload Excel sheet and response with Google sheet link or ID. 2. API to take in the Google sheet ID, the mapping config JSON produced by admin portal and input paramters, then responds with output parameter values. Research on how to achieve this with the latest Google sheet API."

## Clarifications

### Session 2025-10-26

- Q: What backend framework and language should power the production APIs? → A: Express.js with TypeScript per platform direction.
- Q: How will the service satisfy Cloudflare Workers' database connectivity constraints? → A: Use Prisma Data Proxy (HTTPS) to access PostgreSQL from Cloudflare Workers while honoring constitution deployment rules.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Upload Excel for Conversion (Priority: P1)

An internal automation service submits an Excel workbook to the conversion API to create a governed Google Sheet that can be referenced by downstream tools.

**Why this priority**: Without a dependable conversion path, no other workflow in the import pipeline can proceed, so this is the foundational capability.

**Independent Test**: Upload a representative Excel file and confirm the response returns a usable Google Sheet identifier and shareable link without manual intervention.

**Acceptance Scenarios**:

1. **Given** an authenticated client with a valid XLSX file under the supported size limit, **When** it calls the upload endpoint with required metadata, **Then** the backend creates a new Google Sheet and returns the sheet ID, shareable link, and file metadata.
2. **Given** an authenticated client with a corrupt or unsupported Excel file, **When** it calls the upload endpoint, **Then** the backend rejects the request with a clear validation error describing the problem.

---

### User Story 2 - Execute Mapping to Produce Outputs (Priority: P2)

An orchestration service supplies a Google Sheet ID, validated mapping configuration JSON from the admin portal, and runtime input parameters to receive computed output parameter values for downstream systems.

**Why this priority**: Mapping execution delivers the business value of transforming spreadsheet data into consumable parameters, enabling integrations that rely on the admin-defined logic.

**Independent Test**: Submit a Google Sheet ID, mapping JSON, and sample inputs matching a known scenario, then verify the response returns the expected outputs and validation warnings when data is missing.

**Acceptance Scenarios**:

1. **Given** a Google Sheet whose structure matches the mapping configuration and complete input parameters, **When** the client calls the mapping execution endpoint, **Then** the backend returns output parameters with type information and any informational warnings.
2. **Given** a mapping configuration with references that do not exist in the target Google Sheet, **When** the client calls the mapping execution endpoint, **Then** the backend responds with a failed status explaining the missing references without executing partial transformations.

---

### User Story 3 - Maintain Operational Visibility (Priority: P3)

Platform operators review recent conversion and mapping execution activity to diagnose failures, confirm access governance, and ensure audit readiness.

**Why this priority**: Production readiness requires traceability to satisfy compliance and reduce mean time to resolution when Google APIs reject or throttle requests.

**Independent Test**: Query recent conversion and execution records and confirm the system surfaces status, timestamps, triggering client identity, and error context for failed runs.

**Acceptance Scenarios**:

1. **Given** an operator with appropriate access, **When** they request the history for a specific Google Sheet ID, **Then** the backend returns conversion and execution records including status, timestamps, and initiating client identifiers.
2. **Given** a run that failed due to an external Google API error, **When** the operator fetches run details, **Then** the backend includes the Google error code, descriptive message, and retry guidance in the record.

---

### Edge Cases

- Large Excel workbooks near the upper supported file size or worksheet count limits.
- Google Drive or Sheets API quota exhaustion or permission errors mid-conversion.
- Mapping JSON referencing renamed or deleted worksheets or ranges after the initial upload.
- Concurrent conversion requests uploading files with identical names or targeting the same Drive folder.
- Execution requests arriving while a prior mapping run is still processing the same Google Sheet.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The backend MUST expose an authenticated API endpoint that accepts Excel workbooks (XLSX) up to the defined size limit and initiates conversion to a managed Google Sheet.
- **FR-002**: The upload response MUST include the new Google Sheet ID, a shareable URL, file metadata (name, size, worksheet count), and the target Drive folder reference.
- **FR-003**: The backend MUST enforce input validation on uploaded files, rejecting unsupported formats, password-protected workbooks, or files that exceed sheet size constraints with descriptive errors.
- **FR-004**: Conversion operations MUST persist audit records capturing requester identity, timestamps, source file checksum, resulting Google Sheet ID, and status for later retrieval.
- **FR-005**: The backend MUST expose a separate API endpoint that accepts a Google Sheet ID, mapping configuration JSON from the admin portal, and runtime input parameters to trigger mapping evaluation.
- **FR-006**: Mapping execution MUST validate the mapping JSON against the published admin portal schema and return structured validation errors listing the offending properties when validation fails.
- **FR-007**: Mapping execution MUST read the required ranges from the target Google Sheet, applying retries that respect current Google Sheets API quota and exponential backoff guidance.
- **FR-008**: Successful executions MUST return all output parameters with their names, data types, computed values, and any informational warnings generated during evaluation.
- **FR-009**: The backend MUST return actionable error responses when the Google Sheet is inaccessible, missing, or permission-restricted, including error categorization (auth, quota, validation, transient) to guide remediation.
- **FR-010**: All API requests MUST require platform-approved authentication credentials, be authorized per client role, and be logged with correlation identifiers to support tracing across services.
- **FR-011**: Operators MUST be able to request historical conversion and execution records filtered by date range, client, outcome, or Google Sheet ID.

### Key Entities _(include if feature involves data)_

- **Conversion Request**: Represents an Excel upload attempt, storing requester identity, source file metadata, resulting Google Sheet information, status, timestamps, and error messages if applicable.
- **Mapping Execution**: Captures each invocation of the mapping API, including Google Sheet ID, mapping configuration fingerprint, supplied input parameters, outputs, execution duration, and outcome status.
- **Mapping Configuration**: The validated JSON schema produced by the admin portal, referencing sheet ranges, transformation rules, and expected outputs used during execution.

## Assumptions

- API clients are internal services authenticated via the platform's existing machine-to-machine security pattern, and no public access is required.
- Excel files provided by clients do not exceed 10 MB or Google Sheets row/column limits; larger files will be pre-trimmed by upstream tooling.
- Admin portal mapping configurations are current and match the structure of the Google Sheet produced by the latest successful conversion.
- The organization maintains a Google Cloud project with Google Drive and Google Sheets APIs enabled, including service accounts with permission to create and manage sheets in the designated Drive folders.
- Output parameter consumers can process null or default values when mappings omit optional parameters or underlying cells are blank.
- The backend service implementation will use Express.js with TypeScript and connect to PostgreSQL via Prisma Data Proxy (HTTPS) so Cloudflare Workers can meet constitution deployment requirements.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of accepted Excel uploads (≤10 MiB) complete conversion and return Google Sheet ID + link within 60 seconds; 100% of rejected uploads include an error code, category, and remediation message.
- **SC-002**: 99% of successful mapping execution responses return all requested output parameters and any non-blocking warnings within 5 seconds when reading ≤1,000 cells.
- **SC-003**: 100% of mapping validation failures include the first offending schema path and error category, enabling operators to correct configurations without additional support.
- **SC-004**: Audit retrieval queries for a Google Sheet ID covering the last 30 days respond in under 3 seconds and always include correlation IDs plus upstream Google error metadata when failures occurred.
