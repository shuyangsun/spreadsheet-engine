# Implementation Tasks: Admin Portal Prototype v0

**Branch**: `001-admin-portal-prototype`
**Date**: October 23, 2025
**Status**: In Progress

## Task Overview

This task list breaks down the implementation of the Admin Portal prototype into discrete, actionable tasks. The prototype is a single HTML file with embedded CSS and JavaScript.

**Total Tasks**: 15
**Estimated LOC**: 600-800 lines
**Implementation Path**: `src/prototype/admin-portal/v0/index.html`

## Execution Guidelines

- **Sequential by default**: Complete tasks in order unless marked [P] for parallel
- **No tests**: Per constitution, prototypes don't require tests
- **Single file**: All HTML, CSS, and JavaScript in one file
- **Mark completed**: Change `[ ]` to `[X]` as you complete each task

## Phase 1: Setup & Structure (Tasks 1-3)

### Task 1.1: Create Directory Structure

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/`
**Description**: Create the directory structure for the prototype
**Acceptance**: Directory exists and is ready for index.html

**Steps**:

1. Create `src/prototype/admin-portal/v0/` directory
2. Verify path follows constitution file organization rules

---

### Task 1.2: Create HTML Skeleton

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 1.1
**Description**: Create the basic HTML structure with doctype, meta tags, and main sections

**Acceptance**:

- Valid HTML5 document
- Proper charset and viewport meta tags
- Main structural divs for header, inputs, outputs, and export sections

---

### Task 1.3: Implement Material Design CSS Foundations

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (style block)
**Dependencies**: Task 1.2
**Description**: Add base CSS with Material Design 3 principles, including color palette, typography, spacing grid, and elevation.

**Acceptance**:

- CSS variables defined for Material Design colors
- System font stack with font smoothing
- 8px baseline grid established
- Reset/normalize styles applied
- Box-shadow utilities for elevation

---

## Phase 2: Core UI Components (Tasks 4-7)

### Task 2.1: Build Sticky Header with Actions

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 1.3
**Description**: Create sticky header with title, save draft, and clear draft buttons.

**Acceptance**:

- Header stays at top on scroll (position: sticky)
- "Admin Portal" title displayed
- "Save Draft" and "Clear Draft" buttons present

---

### Task 2.2: Build Input Mappings Section with Add Button

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 2.1
**Description**: Create the inputs section with heading, empty state, and "Add Input" button

**Acceptance**:

- Section heading "Input Mappings"
- Empty state with instructional text (shown when no inputs)
- "Add Input" button with Material Design styling
- Container for input mapping items

---

### Task 2.3: Build Output Mappings Section with Add Button

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 2.1
**Description**: Create the outputs section with heading, empty state, and "Add Output" button

**Acceptance**:

- Section heading "Output Mappings"
- Empty state with instructional text (shown when no outputs)
- "Add Output" button with Material Design styling
- Container for output mapping items

---

### Task 2.4: Build Fixed Bottom Action Bar

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 2.1
**Description**: Create fixed bottom bar with primary "Generate JSON" button

**Acceptance**:

- Fixed position at bottom of viewport
- "Generate JSON" primary button (large, prominent)
- Elevated appearance with shadow

---

## Phase 3: Expandable Mapping Components (Tasks 8-9)

### Task 3.1: Implement Compact Mapping Card with Expand/Collapse

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 2.2, Task 2.3
**Description**: Create JavaScript function to render cell mapping as expandable `<details>` element

**Acceptance**:

- Function: `createMappingElement(mapping, type)` returns DOM element
- Uses `<details>` and `<summary>` for native expand/collapse
- Summary shows: sheet name, cell ID, label, type badge, remove button
- Expanded view shows: data type dropdown (inputs only), constraints inputs

---

### Task 3.2: Implement Data Type Selector for Inputs

**Status**: [X] Completed
**Priority**: P2
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 3.1
**Description**: Add data type dropdown to input mappings with 5 options

**Acceptance**:

- Dropdown with options: number, text, percentage, currency, date
- Placeholder: "Select data type..."
- Updates mapping object on change
- Triggers auto-save (debounced)

---

## Phase 4: Constraints & Validation (Tasks 10-11)

### Task 4.1: Implement Constraints Input (Discrete & Range)

**Status**: [X] Completed
**Priority**: P2
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 3.2
**Description**: Add constraint input UI with radio toggle between discrete and range types

**Acceptance**:

- Radio buttons to choose: Discrete Values or Range
- Discrete: Text input for comma-separated values
- Range: Two number inputs (min, max)
- Only one constraint type active at a time
- Updates mapping object on change
- Validates min <= max for ranges

---

### Task 4.2: Implement Validation Logic for JSON Generation

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 4.1
**Description**: Create validation function that checks configuration before JSON export

**Acceptance**:

- Function: `validateConfiguration()` returns array of error strings
- Validates: at least 1 input, at least 1 output
- Validates: all inputs have data type selected
- Validates: no duplicate cell locations
- Validates: cell IDs match Excel format

---

## Phase 5: Data Management (Tasks 12-13)

### Task 5.1: Implement LocalStorage Auto-Save with Debouncing

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 3.1
**Description**: Create auto-save functionality that persists configuration to LocalStorage

**Acceptance**:

- Debounced save function (300ms delay)
- Saves on any change to mappings
- Storage key: "adminPortalDraft"
- Saves entire configuration as JSON string

---

### Task 5.2: Implement Load from LocalStorage and Sample Data

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 5.1
**Description**: Load configuration on page load, with fallback to sample data

**Acceptance**:

- On page load, check LocalStorage for saved draft
- If found: parse JSON and populate UI
- If not found or parse error: load sample data

---

## Phase 6: JSON Export & Polish (Tasks 14-15)

### Task 6.1: Implement JSON Generation and Export Modal

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 4.2
**Description**: Create modal dialog that displays generated JSON with copy and download options

**Acceptance**:

- "Generate JSON" button triggers validation
- If validation fails: show error banner
- If validation passes: show modal with formatted JSON
- "Copy to Clipboard" and "Download" buttons work

---

### Task 6.2: Implement Add/Remove Mapping Interactions

**Status**: [X] Completed
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 3.1, Task 5.1
**Description**: Wire up buttons to add and remove mappings with proper state management

**Acceptance**:

- "Add Input"/"Add Output" buttons create new mappings
- Remove button on each mapping asks for confirmation and deletes
- After add/remove, auto-save is triggered
- Empty state shown/hidden correctly

---

## Task Completion Checklist

### Phase 1: Setup & Structure

- [x] Task 1.1: Create Directory Structure
- [x] Task 1.2: Create HTML Skeleton
- [x] Task 1.3: Implement Material Design CSS Foundations

### Phase 2: Core UI Components

- [x] Task 2.1: Build Sticky Header with Actions
- [x] Task 2.2: Build Input Mappings Section with Add Button
- [x] Task 2.3: Build Output Mappings Section with Add Button
- [x] Task 2.4: Build Fixed Bottom Action Bar

### Phase 3: Expandable Mapping Components

- [x] Task 3.1: Implement Compact Mapping Card with Expand/Collapse
- [x] Task 3.2: Implement Data Type Selector for Inputs

### Phase 4: Constraints & Validation

- [x] Task 4.1: Implement Constraints Input (Discrete & Range)
- [x] Task 4.2: Implement Validation Logic for JSON Generation

### Phase 5: Data Management

- [x] Task 5.1: Implement LocalStorage Auto-Save with Debouncing
- [x] Task 5.2: Implement Load from LocalStorage and Sample Data

### Phase 6: JSON Export & Polish

- [x] Task 6.1: Implement JSON Generation and Export Modal
- [x] Task 6.2: Implement Add/Remove Mapping Interactions
