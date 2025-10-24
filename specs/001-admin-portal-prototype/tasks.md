# Implementation Tasks: Admin Portal Prototype v0

**Branch**: `001-admin-portal-prototype`
**Date**: October 23, 2025
**Status**: Not Started

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

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/`
**Description**: Create the directory structure for the prototype
**Acceptance**: Directory exists and is ready for index.html

**Steps**:

1. Create `src/prototype/admin-portal/v0/` directory
2. Verify path follows constitution file organization rules

---

### Task 1.2: Create HTML Skeleton

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 1.1
**Description**: Create the basic HTML structure with doctype, meta tags, and main sections

**Acceptance**:

- Valid HTML5 document
- Proper charset and viewport meta tags
- Main structural divs for header, inputs, outputs, and export sections

**Implementation Details**:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Portal - Spreadsheet Configuration</title>
    <style>
      /* CSS will go here */
    </style>
  </head>
  <body>
    <header><!-- Sticky header --></header>
    <main>
      <section id="inputs-section"><!-- Input mappings --></section>
      <section id="outputs-section"><!-- Output mappings --></section>
    </main>
    <footer><!-- Fixed action bar --></footer>
    <script>
      /* JavaScript will go here */
    </script>
  </body>
</html>
```

---

### Task 1.3: Implement Material Design CSS Foundations

**Status**: [X] Completed (Enhanced with modern design)
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (style block)
**Dependencies**: Task 1.2
**Description**: Add base CSS with Material Design 3 principles, including color palette, typography, spacing grid, and elevation. **Enhanced with modern Tailwind-inspired colors and consistent border-radius for all buttons.**

**Acceptance**:

- CSS variables defined for Material Design colors (enhanced with modern blue palette)
- System font stack with font smoothing
- 8px baseline grid established
- Reset/normalize styles applied
- Box-shadow utilities for elevation with softer shadows
- Gradient backgrounds for header and badges
- Consistent border-radius (8px for buttons, 12px for large elements)

**CSS Variables Defined**:

```css
:root {
  --md-primary: #2563eb; /* Modern blue */
  --md-primary-dark: #1e40af;
  --md-primary-hover: #1d4ed8;
  --md-surface: #ffffff;
  --md-background: #f8fafc;
  --md-error: #ef4444;
  --md-on-surface: #0f172a;
  --md-on-surface-variant: #64748b;
  --md-outline: #e2e8f0;
  --spacing-unit: 8px;
  --border-radius: 8px; /* Consistent across all buttons */
  --border-radius-large: 12px;
}
```

---

## Phase 2: Core UI Components (Tasks 4-7)

### Task 2.1: Build Sticky Header with Actions

**Status**: [X] Completed (Enhanced with gradient background)
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 1.3
**Description**: Create sticky header with title, save draft, and clear draft buttons. **Enhanced with gradient background and glass-morphism effect on buttons.**

**Acceptance**:

- Header stays at top on scroll (position: sticky)
- "Admin Portal" title displayed with gradient background
- "Save Draft" button with semi-transparent glass effect and proper hover state
- "Clear Draft" button with semi-transparent glass effect and proper hover state
- All buttons consistently rounded with 8px border-radius
- Hover states with visible color change (not same as background)

**HTML Structure**:

```html
<header class="app-header">
  <h1>Admin Portal</h1>
  <div class="header-actions">
    <button id="save-draft-btn" class="button-secondary">Save Draft</button>
    <button id="clear-draft-btn" class="button-secondary">Clear Draft</button>
  </div>
</header>
```

---

### Task 2.2: Build Input Mappings Section with Add Button

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 2.1
**Description**: Create the inputs section with heading, empty state, and "Add Input" button

**Acceptance**:

- Section heading "Input Mappings"
- Empty state with instructional text (shown when no inputs)
- "Add Input" button with Material Design styling
- Container for input mapping items (each with sheet name, cell ID, and label)

**HTML Structure**:

```html
<section id="inputs-section" class="mappings-section">
  <h2>Input Mappings</h2>
  <div id="inputs-empty-state" class="empty-state">
    No input mappings yet. Click "Add Input" to get started.
  </div>
  <div id="inputs-container" class="mappings-container"></div>
  <button id="add-input-btn" class="button-primary">Add Input</button>
</section>
```

---

### Task 2.3: Build Output Mappings Section with Add Button

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 2.1
**Description**: Create the outputs section with heading, empty state, and "Add Output" button

**Acceptance**:

- Section heading "Output Mappings"
- Empty state with instructional text (shown when no outputs)
- "Add Output" button with Material Design styling
- Container for output mapping items

**HTML Structure**: Similar to Task 2.2 but for outputs

---

### Task 2.4: Build Fixed Bottom Action Bar

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 2.1
**Description**: Create fixed bottom bar with primary "Generate JSON" button

**Acceptance**:

- Fixed position at bottom of viewport
- "Generate JSON" primary button (large, prominent)
- Elevated appearance with shadow
- Proper padding and alignment

**HTML Structure**:

```html
<footer class="action-bar">
  <button id="generate-json-btn" class="button-primary button-large">
    Generate JSON
  </button>
</footer>
```

---

## Phase 3: Expandable Mapping Components (Tasks 8-9)

### Task 3.1: Implement Compact Mapping Card with Expand/Collapse

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 2.2, Task 2.3
**Description**: Create JavaScript function to render cell mapping as expandable `<details>` element

**Acceptance**:

- Function: `createMappingElement(mapping, type)` returns DOM element
- Uses `<details>` and `<summary>` for native expand/collapse
- Summary shows: sheet name, cell ID, label, type badge, remove button
- Expanded view shows: data type dropdown (inputs only), constraints inputs
- Proper Material Design card styling with elevation

**Key Features**:

- Type badge colored differently for input vs output
- Smooth CSS transition on expand/collapse
- Remove button with confirmation (prevents accidental deletion)

---

### Task 3.2: Implement Data Type Selector for Inputs

**Status**: [ ] Not Started
**Priority**: P2
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 3.1
**Description**: Add data type dropdown to input mappings with 5 options

**Acceptance**:

- Dropdown with options: number, text, percentage, currency, date
- Placeholder: "Select data type..."
- Required indicator (\*)
- Updates mapping object on change
- Triggers auto-save (debounced)

**HTML Template**:

```html
<select class="data-type-select" required>
  <option value="">Select data type...</option>
  <option value="number">Number</option>
  <option value="text">Text</option>
  <option value="percentage">Percentage</option>
  <option value="currency">Currency</option>
  <option value="date">Date</option>
</select>
```

---

## Phase 4: Constraints & Validation (Tasks 10-11)

### Task 4.1: Implement Constraints Input (Discrete & Range)

**Status**: [ ] Not Started
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

**HTML Template**:

```html
<div class="constraints-section">
  <h4>Constraints (Optional)</h4>
  <div class="constraint-type-selector">
    <label
      ><input type="radio" name="constraint-type" value="discrete" /> Discrete
      Values</label
    >
    <label
      ><input type="radio" name="constraint-type" value="range" /> Range</label
    >
    <label
      ><input type="radio" name="constraint-type" value="none" checked />
      None</label
    >
  </div>
  <div class="discrete-input" style="display:none;">
    <input type="text" placeholder="Enter values separated by commas" />
  </div>
  <div class="range-input" style="display:none;">
    <input type="number" placeholder="Min" /> to
    <input type="number" placeholder="Max" />
  </div>
</div>
```

---

### Task 4.2: Implement Validation Logic for JSON Generation

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 4.1
**Description**: Create validation function that checks configuration before JSON export

**Acceptance**:

- Function: `validateConfiguration()` returns `{valid: boolean, errors: string[]}`
- Validates: at least 1 input, at least 1 output
- Validates: all inputs have data type selected
- Validates: range constraints have min <= max
- Validates: discrete constraints have at least 1 value
- Validates: no duplicate cell locations (same sheet name and cell ID combination)
- Validates: cell IDs match Excel format (e.g., "A1", "B2", "AA100")

**Return Format**:

```javascript
{
    valid: true/false,
    errors: [
        "Configuration must have at least one input mapping",
        "Input 'LoanAmount' is missing a data type",
        // etc.
    ]
}
```

---

## Phase 5: Data Management (Tasks 12-13)

### Task 5.1: Implement LocalStorage Auto-Save with Debouncing

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 3.1
**Description**: Create auto-save functionality that persists configuration to LocalStorage

**Acceptance**:

- Debounced save function (300ms delay)
- Saves on any change to mappings
- Storage key: "adminPortalDraft"
- Saves entire configuration as JSON string
- Handles storage quota exceeded error gracefully

**Key Functions**:

```javascript
function saveToLocalStorage(config) {
  try {
    localStorage.setItem("adminPortalDraft", JSON.stringify(config));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      alert("Storage quota exceeded. Please export your configuration.");
    }
  }
}

const debouncedSave = debounce(saveToLocalStorage, 300);
```

---

### Task 5.2: Implement Load from LocalStorage and Sample Data

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 5.1
**Description**: Load configuration on page load, with fallback to sample data

**Acceptance**:

- On page load, check LocalStorage for saved draft
- If found: parse JSON and populate UI
- If not found or parse error: load sample data (loan calculator example)
- Sample data includes 3 inputs and 2 outputs with various constraint types
- All mappings rendered in UI after load

**Sample Data Structure** (from data-model.md):

```javascript
const sampleData = {
  version: "1.0",
  inputs: [
    {
      sheetName: "Loan Calculator",
      cellId: "B2",
      label: "Loan Amount",
      type: "input",
      dataType: "currency",
      constraints: { type: "range", min: 1000, max: 1000000 },
    },
    {
      sheetName: "Loan Calculator",
      cellId: "B3",
      label: "Annual Interest Rate",
      type: "input",
      dataType: "percentage",
      constraints: { type: "range", min: 0, max: 20 },
    },
    {
      sheetName: "Loan Calculator",
      cellId: "B4",
      label: "Loan Term (years)",
      type: "input",
      dataType: "number",
      constraints: { type: "discrete", values: ["15", "20", "30"] },
    },
  ],
  outputs: [
    {
      sheetName: "Loan Calculator",
      cellId: "B6",
      label: "Monthly Payment",
      type: "output",
    },
    {
      sheetName: "Loan Calculator",
      cellId: "B7",
      label: "Total Interest Paid",
      type: "output",
    },
  ],
};
```

---

## Phase 6: JSON Export & Polish (Tasks 14-15)

### Task 6.1: Implement JSON Generation and Export Modal

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html`
**Dependencies**: Task 4.2
**Description**: Create modal dialog that displays generated JSON with copy and download options

**Acceptance**:

- "Generate JSON" button triggers validation
- If validation fails: show error banner at top with error list
- If validation passes: generate JSON with metadata
- Show modal with formatted JSON in `<pre>` element
- "Copy to Clipboard" button with success feedback
- "Download" button creates file with timestamp in filename
- "Close" button or click outside modal to dismiss

**JSON Structure** (from data-model.md):

```javascript
{
    version: "1.0",
    inputs: [...],
    outputs: [...],
    metadata: {
        createdAt: new Date().toISOString(),
        version: "v0"
    }
}
```

**Modal HTML**:

```html
<div id="json-modal" class="modal" style="display:none;">
  <div class="modal-content">
    <h3>Configuration JSON</h3>
    <pre id="json-output"></pre>
    <div class="modal-actions">
      <button id="copy-json-btn" class="button-primary">
        Copy to Clipboard
      </button>
      <button id="download-json-btn" class="button-primary">Download</button>
      <button id="close-modal-btn" class="button-secondary">Close</button>
    </div>
  </div>
</div>
```

---

### Task 6.2: Implement Add/Remove Mapping Interactions

**Status**: [ ] Not Started
**Priority**: P1 (Blocking)
**Files**: `src/prototype/admin-portal/v0/index.html` (JS section)
**Dependencies**: Task 3.1, Task 5.1
**Description**: Wire up buttons to add and remove mappings with proper state management

**Acceptance**:

- "Add Input" button creates new input mapping with empty fields
- "Add Output" button creates new output mapping with empty fields
- Remove button on each mapping asks for confirmation
- After remove, mapping is deleted from DOM and configuration object
- After add/remove, auto-save is triggered
- Empty state shown/hidden based on mapping count
- Each new mapping gets unique ID for tracking

**Key Functions**:

```javascript
function addInput() {
  const newMapping = {
    id: generateUniqueId(),
    sheetName: "",
    cellId: "",
    label: "",
    type: "input",
    dataType: null,
    constraints: null,
  };
  configuration.inputs.push(newMapping);
  renderMapping(newMapping);
  debouncedSave(configuration);
}

function removeMapping(id, type) {
  if (confirm("Are you sure you want to remove this mapping?")) {
    const array =
      type === "input" ? configuration.inputs : configuration.outputs;
    const index = array.findIndex((m) => m.id === id);
    if (index !== -1) {
      array.splice(index, 1);
      document.querySelector(`[data-mapping-id="${id}"]`).remove();
      updateEmptyStates();
      debouncedSave(configuration);
    }
  }
}
```

---

## Task Completion Checklist

### Phase 1: Setup & Structure

- [ ] Task 1.1: Create Directory Structure
- [ ] Task 1.2: Create HTML Skeleton
- [ ] Task 1.3: Implement Material Design CSS Foundations

### Phase 2: Core UI Components

- [ ] Task 2.1: Build Sticky Header with Actions
- [ ] Task 2.2: Build Input Mappings Section with Add Button
- [ ] Task 2.3: Build Output Mappings Section with Add Button
- [ ] Task 2.4: Build Fixed Bottom Action Bar

### Phase 3: Expandable Mapping Components

- [ ] Task 3.1: Implement Compact Mapping Card with Expand/Collapse
- [ ] Task 3.2: Implement Data Type Selector for Inputs

### Phase 4: Constraints & Validation

- [ ] Task 4.1: Implement Constraints Input (Discrete & Range)
- [ ] Task 4.2: Implement Validation Logic for JSON Generation

### Phase 5: Data Management

- [ ] Task 5.1: Implement LocalStorage Auto-Save with Debouncing
- [ ] Task 5.2: Implement Load from LocalStorage and Sample Data

### Phase 6: JSON Export & Polish

- [ ] Task 6.1: Implement JSON Generation and Export Modal
- [ ] Task 6.2: Implement Add/Remove Mapping Interactions

## Success Criteria

The implementation is complete when:

- ✅ All 15 tasks marked as [X] completed
- ✅ Single HTML file exists at `src/prototype/admin-portal/v0/index.html`
- ✅ File opens in browser without errors
- ✅ Sample data loads automatically on first visit
- ✅ Can add/remove input and output mappings
- ✅ Can configure data types and constraints for inputs
- ✅ Mappings expand/collapse smoothly
- ✅ Configuration auto-saves to LocalStorage
- ✅ Can generate valid JSON matching schema
- ✅ Can copy JSON to clipboard and download as file
- ✅ Clear draft button resets to sample data
- ✅ Validation errors display clearly before JSON generation
- ✅ UI follows Material Design principles
- ✅ Responsive layout works on 1024px+ screens
- ✅ All user stories from spec.md are satisfied

## Estimated Time to Complete

- Phase 1: ~30 minutes (setup and CSS foundations)
- Phase 2: ~45 minutes (UI components)
- Phase 3: ~60 minutes (expandable cards and data type logic)
- Phase 4: ~45 minutes (constraints and validation)
- Phase 5: ~30 minutes (data persistence)
- Phase 6: ~45 minutes (JSON export and polish)

**Total**: ~4-5 hours for a single developer
