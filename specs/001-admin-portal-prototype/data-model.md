# Data Model: Admin Portal Prototype v0

**Date**: October 23, 2025
**Feature**: Admin Portal Prototype
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data structures used in the Admin Portal prototype for managing spreadsheet cell mappings, constraints, and configuration export.

## Core Entities

### 1. CellMapping

Represents a single mapping between a named cell in the spreadsheet and a labeled parameter for the API.

**Properties**:

| Property      | Type       | Required | Description                                                            |
| ------------- | ---------- | -------- | ---------------------------------------------------------------------- |
| `cellName`    | string     | Yes      | The named cell reference from Excel (e.g., "LoanAmount")               |
| `label`       | string     | Yes      | Human-readable label for display (e.g., "Loan Amount")                 |
| `type`        | enum       | Yes      | Either "input" or "output"                                             |
| `dataType`    | string     | No       | For inputs only: "number", "text", "percentage", "currency", or "date" |
| `constraints` | Constraint | No       | For inputs only: value restrictions                                    |

**Validation Rules**:

- `cellName` must not be empty
- `cellName` must be unique across all mappings
- `label` must not be empty
- `type` must be exactly "input" or "output"
- `dataType` is required if `type` is "input"
- `dataType` must be null if `type` is "output"
- `constraints` is optional for inputs, must be null for outputs

**State Transitions**:

- Created → Configured (when dataType assigned for inputs)
- Configured → Complete (when constraints added, if desired)
- Any state → Deleted (when user removes mapping)

### 2. Constraint

Represents value restrictions for an input mapping. Can be either discrete (set of values) or continuous (numeric range).

**Properties**:

| Property | Type     | Required    | Description                                             |
| -------- | -------- | ----------- | ------------------------------------------------------- |
| `type`   | enum     | Yes         | Either "discrete" or "range"                            |
| `values` | string[] | Conditional | Required if type is "discrete": array of allowed values |
| `min`    | number   | Conditional | Required if type is "range": minimum allowed value      |
| `max`    | number   | Conditional | Required if type is "range": maximum allowed value      |

**Validation Rules**:

- `type` must be exactly "discrete" or "range"
- If `type` is "discrete", `values` array must have at least one element
- If `type` is "discrete", `min` and `max` must be null
- If `type` is "range", `values` must be null or empty array
- If `type` is "range", `min` must be less than or equal to `max`
- Discrete values can be any string (numbers will be stored as strings)

**Exclusivity Rule**: A single input can have either discrete values OR a range, never both.

### 3. Configuration

The complete set of all cell mappings. This is the root data structure that gets exported as JSON.

**Properties**:

| Property   | Type          | Required | Description                             |
| ---------- | ------------- | -------- | --------------------------------------- |
| `version`  | string        | Yes      | Schema version, currently "1.0"         |
| `inputs`   | CellMapping[] | Yes      | Array of input mappings (may be empty)  |
| `outputs`  | CellMapping[] | Yes      | Array of output mappings (may be empty) |
| `metadata` | Metadata      | Yes      | Configuration metadata                  |

**Validation Rules**:

- Must have at least one input mapping
- Must have at least one output mapping
- All `inputs` array items must have `type` = "input"
- All `outputs` array items must have `type` = "output"
- No duplicate `cellName` values across inputs and outputs combined

### 4. Metadata

Stores information about the configuration itself.

**Properties**:

| Property    | Type   | Required | Description                                           |
| ----------- | ------ | -------- | ----------------------------------------------------- |
| `createdAt` | string | Yes      | ISO-8601 formatted datetime of configuration creation |
| `version`   | string | Yes      | Application version, currently "v0"                   |

## Relationships

```text
Configuration
├── inputs: CellMapping[] (where type = "input")
│   └── [each may have] constraints: Constraint
├── outputs: CellMapping[] (where type = "output")
└── metadata: Metadata
```

## Data Flow

### 1. Loading

```text
Page Load
  → Check localStorage for "adminPortalDraft"
  → If exists: Parse JSON → Populate UI
  → If not exists: Load sample data → Populate UI
```

### 2. Editing

```text
User Action (add/edit/delete mapping)
  → Update in-memory data structure
  → Trigger debounced save (300ms)
  → Update UI to reflect changes
  → Save to localStorage as JSON string
```

### 3. Validation & Export

```text
User clicks "Generate JSON"
  → Validate configuration:
    - At least 1 input exists
    - At least 1 output exists
    - All inputs have dataType
    - All constraints are valid
  → If invalid: Show errors, halt
  → If valid: Create Configuration object
  → Add metadata (createdAt, version)
  → Serialize to JSON
  → Offer copy to clipboard or download
```

## Sample Data Structure

```json
{
  "version": "1.0",
  "inputs": [
    {
      "cellName": "LoanAmount",
      "label": "Loan Amount",
      "type": "input",
      "dataType": "currency",
      "constraints": {
        "type": "range",
        "min": 1000,
        "max": 1000000
      }
    },
    {
      "cellName": "LoanTerm",
      "label": "Loan Term (years)",
      "type": "input",
      "dataType": "number",
      "constraints": {
        "type": "discrete",
        "values": ["15", "20", "30"]
      }
    },
    {
      "cellName": "InterestRate",
      "label": "Annual Interest Rate",
      "type": "input",
      "dataType": "percentage",
      "constraints": null
    }
  ],
  "outputs": [
    {
      "cellName": "MonthlyPayment",
      "label": "Monthly Payment",
      "type": "output",
      "dataType": null,
      "constraints": null
    },
    {
      "cellName": "TotalInterest",
      "label": "Total Interest Paid",
      "type": "output",
      "dataType": null,
      "constraints": null
    }
  ],
  "metadata": {
    "createdAt": "2025-10-23T14:30:00Z",
    "version": "v0"
  }
}
```

## Implementation Notes

### JavaScript Data Structure

The in-memory representation in JavaScript will be a simple object matching the Configuration schema. No classes or complex objects needed for this prototype.

```javascript
// Global state object
let configuration = {
  version: "1.0",
  inputs: [],
  outputs: [],
  metadata: {
    createdAt: new Date().toISOString(),
    version: "v0",
  },
};
```

### LocalStorage Format

Stored as a JSON string under the key `"adminPortalDraft"`:

```javascript
localStorage.setItem("adminPortalDraft", JSON.stringify(configuration));
```

### Data Type Enumeration

Valid data types are hardcoded in the HTML as select options:

- `"number"` - Plain numeric value
- `"text"` - String/text value
- `"percentage"` - Numeric percentage (0-100)
- `"currency"` - Monetary value
- `"date"` - Date value

### Constraint Type Enumeration

Valid constraint types:

- `"discrete"` - Predefined set of allowed values
- `"range"` - Min/max bounds for numeric values

## Validation Logic

### On Add/Edit Mapping

- Cell name must not be empty
- Label must not be empty
- Cell name must be unique
- Type must be "input" or "output"

### On Generate JSON

- At least 1 input must exist
- At least 1 output must exist
- All inputs must have a dataType selected
- Constraints (if present) must be valid:
  - Discrete: at least 1 value
  - Range: min ≤ max

### Error Messages

| Error Condition       | Message                                               |
| --------------------- | ----------------------------------------------------- |
| No inputs             | "Configuration must have at least one input mapping"  |
| No outputs            | "Configuration must have at least one output mapping" |
| Duplicate cell name   | "Cell name '{name}' already exists"                   |
| Missing data type     | "Input '{label}' is missing a data type"              |
| Invalid range         | "Constraint range min ({min}) must be ≤ max ({max})"  |
| Empty discrete values | "Discrete constraint must have at least one value"    |

## Entity Lifecycle

### CellMapping

1. **Created**: User clicks "Add Input" or "Add Output"
2. **Editing**: User fills in cell name, label
3. **Configured**: User selects data type (for inputs)
4. **Enhanced**: User adds constraints (optional)
5. **Persisted**: Auto-saved to localStorage
6. **Exported**: Included in JSON export
7. **Deleted**: User clicks remove button

### Configuration

1. **Initialized**: On page load (either from localStorage or sample data)
2. **Modified**: As user adds/edits/deletes mappings
3. **Validated**: When user clicks "Generate JSON"
4. **Exported**: JSON copied to clipboard or downloaded
5. **Cleared**: When user clicks "Clear Draft" (resets to sample data)

## Future Extensibility

The data model is designed to be extensible for future versions:

- Additional data types can be added to the enum
- New constraint types can be added (e.g., "regex" for text patterns)
- Additional metadata fields can be added without breaking existing exports
- Version field allows for schema evolution
