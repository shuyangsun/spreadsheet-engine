# Tasks: Calculation Engine Prototype

**Input**: Design documents from `/specs/001-prototype-calc-engine/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested for this prototype; no test tasks generated.

**Organization**: Tasks are grouped by user story to keep each slice independently deliverable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User story assignment (US1, US2, US3)
- Each description includes an explicit file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the calculation engine prototype workspace and align tooling with the admin portal theme.

- [ ] T001 Scaffold Vite React project in `src/prototype/calculation-engine/v0-gpt-5-codex` mirroring admin portal prototype tooling
- [ ] T002 Populate `src/prototype/calculation-engine/v0-gpt-5-codex/package.json` with React 19, shadcn/ui, Tailwind, react-hook-form, and lucide-react dependencies
- [ ] T003 Copy and adapt `tailwind.config.js`, `postcss.config.js`, `tsconfig*.json`, and `vite.config.ts` into `src/prototype/calculation-engine/v0-gpt-5-codex`
- [ ] T004 [P] Seed `src/prototype/calculation-engine/v0-gpt-5-codex/public/theme-tokens.json` with the admin portal color palette for reuse

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Provide shared utilities, layout skeleton, and simulated data required by every user story.

- [ ] T005 Implement React entry point in `src/prototype/calculation-engine/v0-gpt-5-codex/src/main.tsx` wiring Tailwind and ThemeProvider
- [ ] T006 Create shell layout with loading states in `src/prototype/calculation-engine/v0-gpt-5-codex/src/App.tsx`
- [ ] T007 Define global styles and Tailwind imports in `src/prototype/calculation-engine/v0-gpt-5-codex/src/index.css`
- [ ] T008 [P] Author domain types per data-model.md in `src/prototype/calculation-engine/v0-gpt-5-codex/src/lib/types.ts`
- [ ] T009 [P] Bundle hardcoded configuration and sheet snapshot in `src/prototype/calculation-engine/v0-gpt-5-codex/src/lib/sample-data.ts`
- [ ] T010 [P] Build latency and stub fetch helpers in `src/prototype/calculation-engine/v0-gpt-5-codex/src/lib/simulation.ts`
- [ ] T011 Create JSON validation and normalization utilities in `src/prototype/calculation-engine/v0-gpt-5-codex/src/lib/config-parser.ts`

**Checkpoint**: Base project compiled with stub data access ready for user story work.

---

## Phase 3: User Story 1 - Load Config and Sheet Context (Priority: P1) 🎯 MVP

**Goal**: Allow analysts to load a JSON config and sheet link, validate inputs, simulate fetch latency, and display configured inputs with defaults.

**Independent Test**: Upload bundled config and stub sheet link; confirm latency indicator, validation messaging, and populated input list without touching downstream features.

### Implementation Tasks (US1)

- [ ] T012 [US1] Build `ConfigUploadForm` with file + link controls in `src/prototype/calculation-engine/v0-gpt-5-codex/src/components/ConfigUploadForm.tsx`
- [ ] T013 [P] [US1] Implement `useConfigLoader` hook coordinating file parsing and simulated sheet fetch in `src/prototype/calculation-engine/v0-gpt-5-codex/src/hooks/useConfigLoader.ts`
- [ ] T014 [US1] Render input overview list in `src/prototype/calculation-engine/v0-gpt-5-codex/src/components/InputOverviewPanel.tsx`
- [ ] T015 [US1] Integrate loader flow and state gating inside `src/prototype/calculation-engine/v0-gpt-5-codex/src/App.tsx`

**Checkpoint**: User Story 1 delivers a functioning loading experience and exposes input mappings for review.

---

## Phase 4: User Story 2 - Capture Inputs and View Outputs (Priority: P2)

**Goal**: Let analysts edit inputs within constraints, submit values, and view deterministic outputs with notes.

**Independent Test**: Adjust one input within range and outside range; confirm validation feedback, successful submission, and refreshed outputs.

### Implementation Tasks (US2)

- [ ] T016 [US2] Create `useCalculationForm` hook managing react-hook-form state in `src/prototype/calculation-engine/v0-gpt-5-codex/src/hooks/useCalculationForm.ts`
- [ ] T017 [P] [US2] Implement constraint helpers in `src/prototype/calculation-engine/v0-gpt-5-codex/src/lib/constraints.ts`
- [ ] T018 [US2] Build interactive input controls with inline errors in `src/prototype/calculation-engine/v0-gpt-5-codex/src/components/InputControls.tsx`
- [ ] T019 [P] [US2] Encode hardcoded calculation logic in `src/prototype/calculation-engine/v0-gpt-5-codex/src/lib/calculator.ts`
- [ ] T020 [US2] Display outputs and notes via `src/prototype/calculation-engine/v0-gpt-5-codex/src/components/OutputSummary.tsx`

**Checkpoint**: User Story 2 completes when valid submissions refresh outputs and invalid entries show actionable feedback.

---

## Phase 5: User Story 3 - Explore Single-Variable Output Range (Priority: P3)

**Goal**: Enable analysts to sweep one input across its allowed range, generate outputs, and visualize them in a simple x-y plot with supporting table.

**Independent Test**: Select the exploration input, trigger generation, and verify at least five points render in both table and chart within the expected timeframe.

### Implementation Tasks (US3)

- [ ] T021 [US3] Generate exploration series and tabular data in `src/prototype/calculation-engine/v0-gpt-5-codex/src/lib/exploration.ts`
- [ ] T022 [P] [US3] Build exploration controls for input selection in `src/prototype/calculation-engine/v0-gpt-5-codex/src/components/ExplorationControls.tsx`
- [ ] T023 [P] [US3] Render lightweight SVG x-y plot in `src/prototype/calculation-engine/v0-gpt-5-codex/src/components/ExplorationChart.tsx`
- [ ] T024 [US3] Integrate exploration mode and results table into `src/prototype/calculation-engine/v0-gpt-5-codex/src/App.tsx`

**Checkpoint**: User Story 3 is complete when analysts can inspect exploration data visually and numerically without backend support.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final alignment, documentation, and manual verification across the prototype.

- [ ] T025 Review theme alignment in `src/prototype/calculation-engine/v0-gpt-5-codex/src/styles/theme.css` against admin portal reference
- [ ] T026 Document prototype usage in `src/prototype/calculation-engine/v0-gpt-5-codex/README.md`
- [ ] T027 Walk through `specs/001-prototype-calc-engine/quickstart.md` to validate setup instructions remain accurate

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 1 → Phase 2**: Setup must complete before foundational utilities are added.
2. **Phase 2 → Phases 3-5**: Foundational utilities gate all user stories.
3. **Phases 3-5 → Phase 6**: Polish begins after desired user stories are implemented.

### Story Dependencies

- **US1 (P1)**: Depends only on foundational phase; unlocks config-loaded state required by other stories.
- **US2 (P2)**: Requires US1 completion to access validated input mappings but remains independently testable after that.
- **US3 (P3)**: Requires US1 for loaded config and US2 for finalized calculation outputs.

### Task-Level Dependencies

- T001 → T002 → T003 sequence ensures tooling exists before theme seeding (T004).
- T005 precedes App integration tasks (T006, T015, T024).
- T008-T011 provide shared utilities referenced by every user story.
- Hooks/components in later phases depend on their corresponding lib helpers (e.g., T017 before T018, T021 before T023).

---

## Parallel Execution Opportunities

- **Setup**: T004 can run in parallel once T003 is underway.
- **Foundational**: T008, T009, and T010 can proceed concurrently after T005-T007; T011 can start once T008 defines types.
- **User Story 1**: T012 and T014 can develop alongside T013 once hook contract is sketched; all integrate via T015.
- **User Story 2**: T017 and T019 are parallelizable helpers while T016 establishes form state; T018 and T020 integrate afterwards.
- **User Story 3**: T022 and T023 can run concurrently after T021 defines data shape; T024 stitches results into the app.
- **Polish**: T025-T027 can run independently once core functionality lands.

---

## Implementation Strategy

### MVP First

1. Complete Phases 1-2 to establish project scaffolding and shared utilities.
2. Deliver User Story 1 (Phase 3) to achieve a demonstrable MVP that loads configuration data and reveals input mappings.
3. Pause for stakeholder feedback before expanding scope.

### Incremental Delivery

- After MVP, implement User Story 2 to enable constraint-aware editing and output review.
- Follow with User Story 3 to add exploration analytics.
- Finish with polish tasks to align documentation and styling.

### Suggested MVP Scope

- Phases 1-3 (through T015) provide the smallest viable feature slice meeting the primary requirement.

---

## Task Counts

- **Total Tasks**: 27
- **User Story 1 Tasks**: 4
- **User Story 2 Tasks**: 5
- **User Story 3 Tasks**: 4
- **Parallel-Eligible Tasks**: 9 (marked with `[P]`)
- **Independent Tests**:
  - US1: Load config + sheet, verify latency indicator and input list.
  - US2: Edit inputs within/outside constraints, confirm output refresh and validation.
  - US3: Generate exploration series and confirm chart + table render with ≥5 points.

---

**Recommended next step**: Begin Phase 1 with T001; ensure each phase passes its checkpoint before moving forward.
