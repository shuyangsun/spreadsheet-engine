---
description: "Task list for Excel-to-Google Sheet Conversion Backend (Production)"
---

# Tasks: Excel-to-Google Sheet Conversion Backend (Production)

**Input**: Design documents from `/specs/001-sheet-conversion-backend/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No automated tests requested (per constitution rule 5). Manual verification steps are captured in quickstart.md and polish tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline configuration

- [ ] T001 Scaffold backend package structure in `src/production/backend/sheet-conversion/` (create `src/`, `prisma/`, `scripts/`, `docs/`, `README.md`).
- [ ] T002 Initialize pnpm manifest with required dependencies and scripts in `src/production/backend/sheet-conversion/package.json`.
- [ ] T003 [P] Configure TypeScript compiler options for Node 20 + Workers in `src/production/backend/sheet-conversion/tsconfig.json`.
- [ ] T004 [P] Configure Cloudflare Worker deployment with `nodejs_compat` in `src/production/backend/sheet-conversion/wrangler.toml`.
- [ ] T005 [P] Add environment template documenting required secrets at `src/production/backend/sheet-conversion/.env.example`.
- [ ] T006 Register the sheet-conversion workspace entry in `pnpm-workspace.yaml` so `pnpm --filter sheet-conversion-backend` resolves.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before any user story work begins

- [ ] T007 Define Prisma schema with `ConversionRequest`, `MappingExecution`, `MappingConfigurationSnapshot`, and `ApiClient` models in `src/production/backend/sheet-conversion/prisma/schema.prisma`.
- [ ] T008 Create Prisma client factory for Cloudflare Workers in `src/production/backend/sheet-conversion/src/repositories/prisma-client.ts`.
- [ ] T009 [P] Implement typed environment loader in `src/production/backend/sheet-conversion/src/config/environment.ts` (includes Google + database settings).
- [ ] T010 [P] Implement Pino logger configuration with correlation ID support in `src/production/backend/sheet-conversion/src/config/logger.ts`.
- [ ] T011 Implement JWT authentication middleware enforcing internal tokens in `src/production/backend/sheet-conversion/src/middleware/authenticate.ts`.
- [ ] T012 Implement error handling middleware that maps domain errors to API responses in `src/production/backend/sheet-conversion/src/middleware/error-handler.ts`.
- [ ] T013 [P] Create Zod-based request validation helper in `src/production/backend/sheet-conversion/src/middleware/validate-request.ts`.
- [ ] T014 [P] Create Google service account auth helper returning OAuth2 clients in `src/production/backend/sheet-conversion/src/services/google-auth/service-account.ts`.
- [ ] T015 [P] Wrap Google Drive API conversion calls in `src/production/backend/sheet-conversion/src/services/google-drive/drive-client.ts`.
- [ ] T016 [P] Wrap Google Sheets batch value reads in `src/production/backend/sheet-conversion/src/services/google-sheets/sheets-client.ts`.
- [ ] T017 Create shared audit repository scaffolding in `src/production/backend/sheet-conversion/src/repositories/audit-repository.ts` (placeholders for conversions/executions).
- [ ] T018 Establish root API router shell with health endpoint in `src/production/backend/sheet-conversion/src/api/router.ts`.
- [ ] T019 Compose Express app with middleware, routing, and correlation IDs in `src/production/backend/sheet-conversion/src/app.ts`.
- [ ] T020 Create Cloudflare Worker entrypoint exporting the Express fetch handler in `src/production/backend/sheet-conversion/src/main.ts`.

**Checkpoint**: Foundation ready — user stories can now proceed in parallel once this phase completes.

---

## Phase 3: User Story 1 - Upload Excel for Conversion (Priority: P1) 🎯 MVP

**Goal**: Allow an internal automation service to upload an Excel workbook, convert it to a governed Google Sheet, and receive the sheet ID/link.

**Independent Test**: Use curl (per quickstart) to POST a valid XLSX file to `/conversion/upload`; verify response contains sheet ID, link, and file metadata. Repeat with an invalid/corrupt file to confirm descriptive validation error.

### Implementation for User Story 1

- [ ] T021 [P] [US1] Define conversion request/response schemas with Zod in `src/production/backend/sheet-conversion/src/domains/conversion/conversion-schemas.ts`.
- [ ] T022 [P] [US1] Extend audit repository with conversion persistence methods in `src/production/backend/sheet-conversion/src/repositories/audit-repository.ts`.
- [ ] T023 [US1] Implement conversion service orchestrating Drive upload, error categorization, and audit logging in `src/production/backend/sheet-conversion/src/domains/conversion/conversion-service.ts`.
- [ ] T024 [P] [US1] Implement Multer upload middleware with file size/type validation in `src/production/backend/sheet-conversion/src/api/conversion/upload-middleware.ts`.
- [ ] T025 [US1] Create conversion controller matching OpenAPI response in `src/production/backend/sheet-conversion/src/api/conversion/upload-controller.ts`.
- [ ] T026 [US1] Register `POST /conversion/upload` router and mount in `src/production/backend/sheet-conversion/src/api/conversion/router.ts` and `src/production/backend/sheet-conversion/src/app.ts`.

**Checkpoint**: User Story 1 independently delivers the Excel → Google Sheet conversion flow and audit logging.

---

## Phase 4: User Story 2 - Execute Mapping to Produce Outputs (Priority: P2)

**Goal**: Allow an orchestration service to execute admin-defined mappings on a Google Sheet and receive computed output parameters with warnings.

**Independent Test**: POST a valid mapping payload (from shared configuration JSON) and inputs to `/mapping/execute`; verify outputs and warnings match expectations. Submit a payload referencing missing ranges to confirm failure with targeted errors.

### Implementation for User Story 2

- [ ] T027 [P] [US2] Create mapping validation adapters bridging shared configuration schema in `src/production/backend/sheet-conversion/src/domains/mapping/mapping-schemas.ts`.
- [ ] T028 [P] [US2] Extend audit repository with mapping execution persistence methods in `src/production/backend/sheet-conversion/src/repositories/audit-repository.ts`.
- [ ] T029 [US2] Implement mapping execution service to validate config, read Google Sheets ranges, apply transforms, and categorize errors in `src/production/backend/sheet-conversion/src/domains/mapping/mapping-service.ts`.
- [ ] T030 [US2] Create mapping controller returning outputs and warnings in `src/production/backend/sheet-conversion/src/api/mapping/execute-controller.ts`.
- [ ] T031 [US2] Register `POST /mapping/execute` router and mount in `src/production/backend/sheet-conversion/src/api/mapping/router.ts` and `src/production/backend/sheet-conversion/src/app.ts`.

**Checkpoint**: User Stories 1 and 2 now operate independently, enabling both upload and mapping execution flows.

---

## Phase 5: User Story 3 - Maintain Operational Visibility (Priority: P3)

**Goal**: Provide operators with audit visibility over conversions and mapping executions, including error context for failures.

**Independent Test**: Query the audit endpoints for a Google Sheet ID to retrieve recent conversions/executions with status, timestamps, and initiating client. Request details for a failed run to confirm Google error metadata and retry guidance are included.

### Implementation for User Story 3

- [ ] T032 [P] [US3] Define audit query/request/response schemas in `src/production/backend/sheet-conversion/src/domains/audit/audit-schemas.ts`.
- [ ] T033 [P] [US3] Extend audit repository with query filters (sheet ID, client, outcome, date range) in `src/production/backend/sheet-conversion/src/repositories/audit-repository.ts`.
- [ ] T034 [US3] Implement audit reporting service aggregating histories and failure context in `src/production/backend/sheet-conversion/src/domains/audit/audit-service.ts`.
- [ ] T035 [US3] Create operator audit endpoints and router in `src/production/backend/sheet-conversion/src/api/audit/audit-controller.ts`, `src/production/backend/sheet-conversion/src/api/audit/router.ts`, and update `src/production/backend/sheet-conversion/src/app.ts`.

**Checkpoint**: All three user stories are independently functional with full audit visibility.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, operational hardening, and manual validation

- [ ] T036 [P] Document setup, run, and deploy procedures in `src/production/backend/sheet-conversion/README.md`.
- [ ] T037 [P] Create manual smoke test script covering upload + mapping flows at `src/production/backend/sheet-conversion/scripts/smoke.sh`.
- [ ] T038 Align quickstart instructions with final commands and curl examples in `specs/001-sheet-conversion-backend/quickstart.md`.

---

## Dependencies & Execution Order

1. **Phase 1 → Phase 2**: Setup tasks (T001–T006) must complete before foundational infrastructure begins.
2. **Phase 2 → User Stories**: Foundational tasks (T007–T020) unblock all user stories; no story work should start before this checkpoint.
3. **User Stories Priority**: Implement in priority order (US1 → US2 → US3) unless staffing allows parallel development after Phase 2 completion.
4. **Polish**: Phase 6 tasks (T036–T038) execute after desired user stories are shipped.

---

## Parallel Execution Opportunities

- **Phase 1**: T003, T004, and T005 can run in parallel once T001–T002 establish the package skeleton.
- **Phase 2**: T009–T016 operate on distinct modules and can proceed concurrently after Prisma scaffolding (T007–T008).
- **User Story 1**: T021 and T024 can start together (schemas vs. middleware) before wiring through service/controller tasks.
- **User Story 2**: T027 and T028 can run in parallel while T029 focuses on service orchestration.
- **User Story 3**: T032 and T033 can progress simultaneously (schemas vs. repository queries) prior to service and controller integration.
- **Polish**: T036 and T037 target independent documentation/script files and may run concurrently.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Deliver Phase 3 (User Story 1) and validate upload + conversion flow manually.
3. Optionally deploy/demo once MVP smoke tests pass.

### Incremental Delivery

1. After MVP, implement Phase 4 (User Story 2) to unlock mapping execution.
2. Implement Phase 5 (User Story 3) for operator visibility when required.
3. Execute Phase 6 polish tasks to finalize documentation and operational scripts.

### Parallel Team Strategy

- Team converges on Phases 1–2 together.
- After Phase 2, developers can split across US1, US2, and US3 using the [P] markers to avoid merge conflicts.
- Reconvene for Phase 6 polish activities once core stories are validated.

---
