---
description: "Task list for Import JSON Configurations"
---

# Tasks: Import JSON Configurations

**Input**: Design documents from `/specs/001-import-config/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested for this prototype.

**Organization**: Tasks are grouped by user story so each slice can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Task can run in parallel (different files, no blocking dependencies)
- **[Story]**: Maps task to a user story (US1, US2, US3)
- Descriptions include exact file paths to modify

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure the prototype workspace is ready for iteration.

- [x] T001 Install npm dependencies in `src/prototype/admin-portal/v1-gpt-5-codex`
- [x] T002 Review existing sample configuration data in `src/prototype/admin-portal/v1-gpt-5-codex/src/lib/sample-data.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish baseline data structures and utilities required by all stories.

- [x] T003 Update configuration and baseline types to include import metadata and enforce input/output metadata rules (input `dataType` required, input `constraints` optional, outputs without either) in `src/prototype/admin-portal/v1-gpt-5-codex/src/lib/types.ts`
- [x] T004 Persist draft plus baseline bundles through local storage helpers in `src/prototype/admin-portal/v1-gpt-5-codex/src/lib/storage.ts`
- [x] T005 Add normalized export comparison and version parsing utilities in `src/prototype/admin-portal/v1-gpt-5-codex/src/lib/utils.ts`

**Checkpoint**: Shared foundations in place; user story work can begin.

---

## Phase 3: User Story 1 - Resume Configuration from Imported JSON (Priority: P1) 🎯 MVP

**Goal**: Allow administrators to import a previously exported JSON configuration, confirm imports when unsaved edits exist, and repopulate the UI with the imported data.

**Independent Test**: Export the current configuration, clear the UI, import the JSON, and verify every mapping, data type, constraint, and metadata value matches the saved state while the confirmation dialog protects unsaved edits.

### Implementation for User Story 1

- [x] T006 [US1] Insert an "Import" button and hidden file input beside the configuration heading in `src/prototype/admin-portal/v1-gpt-5-codex/src/App.tsx`
- [x] T007 [P] [US1] Create `ImportConfirmDialog` component using shadcn/ui alert dialog primitives in `src/prototype/admin-portal/v1-gpt-5-codex/src/components/ImportConfirmDialog.tsx`
- [x] T008 [US1] Detect unsaved edits and render the confirmation dialog before importing in `src/prototype/admin-portal/v1-gpt-5-codex/src/App.tsx`
- [x] T009 [US1] Implement FileReader-based JSON import and mapping helpers that validate metadata rules (require input `dataType`, optional input `constraints`, ignore output metadata) in `src/prototype/admin-portal/v1-gpt-5-codex/src/App.tsx` and `src/prototype/admin-portal/v1-gpt-5-codex/src/lib/validation.ts`
- [x] T010 [US1] Persist imported drafts and baseline snapshots through the updated storage helpers in `src/prototype/admin-portal/v1-gpt-5-codex/src/App.tsx`

**Checkpoint**: Import workflow operational with confirmation safeguards.

---

## Phase 4: User Story 2 - Maintain Version Integrity After Import (Priority: P2)

**Goal**: Ensure exported configurations retain the imported version when unchanged and increment exactly once when edits occur.

**Independent Test**: Import a configuration with version `v5`, export immediately to confirm version stays `v5`, make an edit, export again and verify version becomes `v6`, then revert to the baseline and confirm another export remains at `v6`.

### Implementation for User Story 2

- [x] T011 [US2] Compare normalized export payloads against the baseline before download in `src/prototype/admin-portal/v1-gpt-5-codex/src/App.tsx`
- [x] T012 [US2] Refresh the baseline snapshot after successful exports to prevent duplicate increments in `src/prototype/admin-portal/v1-gpt-5-codex/src/App.tsx` and `src/prototype/admin-portal/v1-gpt-5-codex/src/lib/storage.ts`
- [x] T013 [P] [US2] Display toast messaging that indicates whether the version was retained or incremented in `src/prototype/admin-portal/v1-gpt-5-codex/src/App.tsx`

**Checkpoint**: Version management consistent across import/export cycles.

---

## Phase 5: User Story 3 - Handle Invalid or Incompatible Imports (Priority: P3)

**Goal**: Reject malformed or incompatible JSON files with actionable messaging while leaving the current configuration untouched.

**Independent Test**: Attempt imports with malformed JSON, missing required sections, and unsupported schema versions; verify each attempt is blocked with a descriptive message and the existing configuration remains intact.

### Implementation for User Story 3

- [ ] T014 [US3] Validate imported JSON against the configuration schema with detailed errors, including enforcement of input/output metadata rules, in `src/prototype/admin-portal/v1-gpt-5-codex/src/lib/validation.ts`
- [ ] T015 [US3] Surface validation failures via destructive toasts without mutating state in `src/prototype/admin-portal/v1-gpt-5-codex/src/App.tsx`
- [ ] T016 [P] [US3] Guard against schema version mismatches and guide remediation in `src/prototype/admin-portal/v1-gpt-5-codex/src/App.tsx`

**Checkpoint**: Imports reject invalid inputs gracefully while preserving current work.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation and manual validation across stories.

- [ ] T017 Update prototype documentation with the import workflow in `src/prototype/admin-portal/v1-gpt-5-codex/README.md`
- [ ] T018 [P] Execute manual validation steps outlined in `specs/001-import-config/quickstart.md` and record any follow-ups

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 1 → Phase 2**: Environment preparation precedes foundational updates.
2. **Phase 2 → Phases 3–5**: Baseline types/utilities must exist before implementing any user story.
3. **Phases 3–5 → Phase 6**: Complete desired user stories before polish and validation.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 tasks (T003–T005).
- **US2 (P2)**: Depends on US1 completion (T006–T010) to reuse import baseline data.
- **US3 (P3)**: Depends on US1 completion for import pipeline hooks; can run in parallel with US2 once US1 is complete.

### Within-Story Sequencing

- **US1**: T006 → (T007 ∥ T008) → T009 → T010.
- **US2**: T011 → T012 → T013.
- **US3**: T014 → T015 → T016.

## Parallel Execution Examples

- **US1**: After T006, T007 (component scaffolding) and T008 (unsaved edit wiring) can proceed in parallel before integrating via T009.
- **US2**: Once T011 establishes comparison logic, T013 (toast feedback) can evolve in parallel while T012 finalizes baseline persistence.
- **US3**: With validation utilities from T014 in place, T016 can run alongside T015 to implement version-specific guardrails and messaging.

## Implementation Strategy

### MVP First (Deliver User Story 1)

1. Complete Phase 1 (T001–T002) and Phase 2 (T003–T005).
2. Implement US1 tasks (T006–T010) to unlock JSON import with safeguards.
3. Validate using the US1 independent test before continuing.

### Incremental Delivery

- Add US2 (T011–T013) to introduce version integrity once imports work.
- Layer US3 (T014–T016) to harden validation.
- Finish with polish tasks (T017–T018) for docs and manual QA.

### Parallel Team Strategy

- Developer A handles foundational updates (T003–T005) then US1 core tasks (T006, T008, T009).
- Developer B builds reusable UI components and messaging (T007, T010, T013, T016).
- Developer C focuses on validation and storage concerns (T011, T012, T014, T015, T018).
