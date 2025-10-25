# Tasks: Shared Configuration Backend Prep

**Input**: Design documents from `/specs/001-prepare-json-import/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested. No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capture current state so subsequent refactor tasks avoid redo

- [x] T001 Document existing shared components in `src/shared/configuration` to confirm baseline scope before changes.
- [x] T002 Review admin portal shared imports under `src/prototype/admin-portal/v1-gpt-5-codex/src/lib` to map current dependencies on legacy helpers.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure shared-module import plumbing is ready for cross-project reuse

- [x] T003 Validate that TypeScript path alias `@shared/*` is defined in both `src/prototype/admin-portal/v1-gpt-5-codex/tsconfig.json` and `src/prototype/admin-portal/v1-gpt-5-codex/tsconfig.app.json`.
- [x] T004 Confirm Vite alias configuration for `@shared` in `src/prototype/admin-portal/v1-gpt-5-codex/vite.config.ts` supports shared module consumption.

**Checkpoint**: Aliases verified—user story work can proceed.

---

## Phase 3: User Story 1 - Share Validation Logic (Priority: P1) 🎯 MVP

**Goal**: Make shared validation and normalization modules consumable by both admin portal and calculation engine

**Independent Test**: Run a Node script that feeds valid and invalid configuration JSON payloads into the shared module and observe normalized output vs. validation errors.

### Implementation for User Story 1

- [x] T005 [US1] Create canonical schema file at `src/shared/configuration/configuration.schema.json` based on `specs/001-prepare-json-import/contracts/configuration.schema.json`.
- [x] T006 [P] [US1] Update `src/shared/configuration/index.ts` to export validation helpers, transforms, types, and the canonical schema entry point for downstream consumers.
- [x] T007 [US1] Add example validation script `src/shared/configuration/examples/validate-config.ts` demonstrating reuse of `validateImportedJson` with the shared schema.

**Checkpoint**: Shared module exposes schema and validation APIs independently of the admin portal.

---

## Phase 4: User Story 2 - Preserve Admin Portal Behavior (Priority: P2)

**Goal**: Ensure the admin portal keeps identical import/validation behaviour after consuming shared modules

**Independent Test**: Import a known configuration through the admin portal UI and confirm generated drafts and error messaging match pre-refactor behaviour.

### Implementation for User Story 2

- [x] T008 [P] [US2] Ensure `src/prototype/admin-portal/v1-gpt-5-codex/src/lib/utils.ts` re-exports shared ID and transform helpers instead of duplicating logic.
- [x] T009 [P] [US2] Ensure `src/prototype/admin-portal/v1-gpt-5-codex/src/lib/validation.ts` fully delegates to shared validation exports without retaining stale code paths.
- [ ] T010 [US2] Perform manual smoke test of import flow using `src/prototype/admin-portal/v1-gpt-5-codex/src/lib/sample-data.ts` to confirm draft persistence and error messages remain unchanged.

**Checkpoint**: Admin portal operates identically while depending on shared logic.

---

## Phase 5: User Story 3 - Document Shared Component Boundaries (Priority: P3)

**Goal**: Provide concise guidance on which shared modules exist, what they export, and how future services should use them

**Independent Test**: A backend engineer can follow the documentation to locate the shared module and run the example validation script within five minutes.

### Implementation for User Story 3

- [x] T011 [P] [US3] Update `src/shared/README.md` with module inventory, schema location, and usage notes for both admin portal and calculation engine teams.
- [x] T012 [US3] Align `specs/001-prepare-json-import/quickstart.md` with the final example script and schema workflow instructions.

**Checkpoint**: Documentation clearly delineates shared boundaries and consumption steps.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation across the refactor scope

- [ ] T013 [P] Run `npm run lint` in `src/prototype/admin-portal/v1-gpt-5-codex` to ensure refactor left no lint regressions.
- [ ] T014 Summarize outstanding follow-up (if any) in `specs/001-prepare-json-import/spec.md` notes or future work section to aid handoff.

---

## Dependencies & Execution Order

1. **Phase 1 → Phase 2**: Capture baseline before verifying alias plumbing.
2. **Phase 2 → Phase 3**: Alias verification is required before shipping shared assets.
3. **Phase 3 (US1)**: MVP deliverable; unblock remaining stories once shared module ready.
4. **Phase 4 (US2)**: Depends on shared module; can run in parallel with Phase 5 once US1 complete.
5. **Phase 5 (US3)**: Documentation relies on finalized shared API from US1 and portal behaviour from US2.
6. **Phase 6**: After desired stories wrap, perform polish tasks.

## Parallel Opportunities

- T006 and T007 (US1) can proceed in parallel after T005 creates the schema file.
- T008 and T009 (US2) target different files and can be parallelized once US1 delivers exports.
- Documentation tasks T011 and T012 can run concurrently after US1 exports stabilize.
- Lint validation T013 can run while documentation updates finalize (no conflicting files).

## Implementation Strategy

- **MVP**: Complete Phase 3 (US1) after foundational work—shared module ready for consumption.
- **Incremental Delivery**: Deliver US1 first, then US2 to confirm no regressions, followed by US3 documentation.
- **Optional Parallelization**: With multiple contributors, assign US2 and US3 in parallel post-US1, reserving Phase 6 polish for the final pass.
