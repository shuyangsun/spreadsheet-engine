# Implementation Tasks: Admin Portal Prototype v1-gpt-5-codex

**Branch**: `001-admin-portal-prototype`
**Date**: October 23, 2025
**Status**: In Progress

## Task Overview

This task list breaks down the implementation of the Admin Portal prototype using React, shadcn/ui, and Tailwind CSS into discrete, actionable tasks.

**Total Tasks**: 12
**Estimated LOC**: 400-600 lines
**Implementation Path**: `src/prototype/admin-portal/v1-gpt-5-codex/`

## Execution Guidelines

- **Sequential by default**: Complete tasks in order unless marked [P] for parallel
- **No tests**: Per constitution, prototypes don't require tests
- **Component-based**: Use React components with shadcn/ui library
- **Mark completed**: Change `[ ]` to `[X]` as you complete each task

## Phase 1: Setup & Project Initialization (Tasks 1-3)

### Task 1.1: Initialize Vite React Project

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v1-gpt-5-codex/`
**Description**: Create a new Vite React project with TypeScript support
**Acceptance**: Vite project initialized with React 19 and basic structure in place

**Steps**:

1. Navigate to `src/prototype/admin-portal/`
2. Run `npm create vite@latest v1-gpt-5-codex -- --template react-ts`
3. Install dependencies with `npm install`

---

### Task 1.2: Install and Configure Tailwind CSS

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `tailwind.config.js`, `src/index.css`
**Dependencies**: Task 1.1
**Description**: Add Tailwind CSS to the project

**Acceptance**:

- Tailwind CSS installed and configured
- Base styles imported in main CSS file
- Tailwind directives working in components

---

### Task 1.3: Initialize shadcn/ui

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `components.json`, `src/components/ui/`
**Dependencies**: Task 1.2
**Description**: Set up shadcn/ui with necessary configuration

**Acceptance**:

- shadcn/ui CLI initialized
- Component directory structure created
- Base configuration complete

---

## Phase 2: Install shadcn Components (Task 4)

### Task 2.1: Install Required shadcn/ui Components

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `src/components/ui/`
**Dependencies**: Task 1.3
**Description**: Install shadcn/ui components needed for the application

**Acceptance**:

- Button component installed
- Card component installed
- Input component installed
- Select component installed
- Dialog component installed
- Label component installed
- Separator component installed
- Accordion component installed (for expandable sections)

---

## Phase 3: Core Application Structure (Tasks 5-6)

### Task 3.1: Create Main Layout and Header

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `src/App.tsx`, `src/components/Header.tsx`
**Dependencies**: Task 2.1
**Description**: Build the main application layout with header containing save/clear actions

**Acceptance**:

- App component with main layout structure
- Header component with title and action buttons
- Responsive layout using Tailwind classes

---

### Task 3.2: Create Configuration State Management

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `src/App.tsx`, `src/lib/storage.ts`
**Dependencies**: Task 3.1
**Description**: Set up React state for configuration data and LocalStorage utilities

**Acceptance**:

- Configuration state initialized in App component
- LocalStorage save/load functions created
- Debounced auto-save implemented
- Sample data loaded on first visit

---

## Phase 4: Cell Mapping Components (Tasks 7-8)

### Task 4.1: Create MappingCard Component

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `src/components/MappingCard.tsx`
**Dependencies**: Task 3.2
**Description**: Build reusable component for displaying cell mappings with shadcn Card and Accordion

**Acceptance**:

- Card component displays sheet name, cell ID, and label
- Type badge (Input/Output) displayed
- Remove button with confirmation
- Expandable details section using Accordion

---

### Task 4.2: Create MappingForm Component

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `src/components/MappingForm.tsx`
**Dependencies**: Task 4.1
**Description**: Build form for adding/editing cell mappings

**Acceptance**:

- Input fields for sheet name, cell ID, and label using shadcn Input
- Data type selector using shadcn Select (for inputs only)
- Add mapping functionality
- Form validation

---

## Phase 5: Constraints & Validation (Tasks 9-10)

### Task 5.1: Create ConstraintsInput Component

**Status**: [X] Complete
**Priority**: P2
**Files**: `src/components/ConstraintsInput.tsx`
**Dependencies**: Task 4.2
**Description**: Build UI for defining constraints (discrete values or ranges)

**Acceptance**:

- Toggle between discrete and range constraint types
- Input for comma-separated discrete values
- Min/max inputs for range constraints
- Validation for range (min <= max)

---

### Task 5.2: Implement Configuration Validation

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `src/lib/validation.ts`
**Dependencies**: Task 5.1
**Description**: Create validation logic for configuration export

**Acceptance**:

- Validation function checks for required inputs/outputs
- Checks for data types on all inputs
- Validates constraint integrity
- Returns clear error messages

---

## Phase 6: Export Functionality (Task 11)

### Task 6.1: Create Export Dialog Component

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `src/components/ExportDialog.tsx`
**Dependencies**: Task 5.2
**Description**: Build dialog for displaying and exporting JSON using shadcn Dialog

**Acceptance**:

- Dialog triggered by Generate JSON button
- Formatted JSON display
- Copy to clipboard functionality with visual feedback
- Download as file functionality
- Error display if validation fails

---

## Phase 7: Polish & Integration (Task 12)

### Task 7.1: Integrate All Components and Add Empty States

**Status**: [X] Complete
**Priority**: P1 (Blocking)
**Files**: `src/App.tsx`
**Dependencies**: Task 6.1
**Description**: Wire all components together and add empty states

**Acceptance**:

- Input and output sections integrated
- Empty states displayed when no mappings exist
- All user interactions trigger appropriate state updates
- Auto-save working on all changes
- Application fully functional end-to-end

---

## Task Completion Checklist

### Phase 1: Setup & Project Initialization

- [x] Task 1.1: Initialize Vite React Project
- [x] Task 1.2: Install and Configure Tailwind CSS
- [x] Task 1.3: Initialize shadcn/ui

### Phase 2: Install shadcn Components

- [x] Task 2.1: Install Required shadcn/ui Components

### Phase 3: Core Application Structure

- [x] Task 3.1: Create Main Layout and Header
- [x] Task 3.2: Create Configuration State Management

### Phase 4: Cell Mapping Components

- [x] Task 4.1: Create MappingCard Component
- [x] Task 4.2: Create MappingForm Component

### Phase 5: Constraints & Validation

- [x] Task 5.1: Create ConstraintsInput Component
- [x] Task 5.2: Implement Configuration Validation

### Phase 6: Export Functionality

- [x] Task 6.1: Create Export Dialog Component

### Phase 7: Polish & Integration

- [x] Task 7.1: Integrate All Components and Add Empty States
