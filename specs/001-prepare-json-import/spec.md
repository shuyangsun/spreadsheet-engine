# Feature Specification: Shared Configuration Backend Prep

**Feature Branch**: `001-prepare-json-import`
**Created**: 2025-10-25
**Status**: Draft
**Input**: User description: "Refactor backend shared components for JSON import validation by moving reusable backend code into src/shared to support the spreadsheet calculation engine. Limit to minimal backend refactor, only code needed for import and validation."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Share Validation Logic (Priority: P1)

A platform engineer reuses the shared configuration validation module to verify JSON files exported from the admin portal before the spreadsheet calculation engine consumes them.

**Why this priority**: Without shared validation the upcoming engine risks loading malformed configurations, blocking the core integration.

**Independent Test**: Provide a valid and an invalid configuration JSON file to the shared module and confirm it returns a normalized configuration or descriptive validation errors without relying on the admin portal UI.

**Acceptance Scenarios**:

1. **Given** a configuration JSON that matches the supported schema, **When** the engineer validates it through the shared module, **Then** the module returns a structured configuration object ready for engine consumption.
2. **Given** a configuration JSON missing required sections, **When** the engineer validates it through the shared module, **Then** the module reports clear, field-level errors explaining what must be corrected.

---

### User Story 2 - Preserve Admin Portal Behavior (Priority: P2)

An admin portal maintainer continues to import draft configurations and receives identical results after the backend logic moves into the shared module.

**Why this priority**: The refactor must be transparent to current users so production workflows remain uninterrupted while the shared code evolves.

**Independent Test**: Import a known configuration through the admin portal and verify the outcomes match pre-refactor behavior (successful draft creation, same validation messages, unchanged local storage payloads).

**Acceptance Scenarios**:

1. **Given** a previously exported configuration file, **When** it is re-imported via the admin portal after the refactor, **Then** the resulting draft bundle matches historical behavior including generated identifiers and metadata.
2. **Given** a configuration file with duplicate cell locations, **When** it is imported, **Then** the admin portal still surfaces the same duplicate-location error messaging as before the refactor.

---

### User Story 3 - Document Shared Component Boundaries (Priority: P3)

A backend engineer reviews lightweight documentation that explains which configuration modules now live under `src/shared` and how they should be consumed by future services.

**Why this priority**: Clarity on shared boundaries prevents future teams from relying on UI-specific helpers or duplicating logic when the calculation engine project begins.

**Independent Test**: Read the updated developer notes and confirm they list the shared modules, their responsibilities, and any limitations for JSON import use cases.

**Acceptance Scenarios**:

1. **Given** new documentation in the repository, **When** an engineer searches for configuration import guidance, **Then** they find a concise summary that points to the shared modules and their exported capabilities.

### Edge Cases

- Invalid JSON payloads that cannot be parsed before validation begins.
- Mismatched schema versions between the top-level configuration and embedded metadata.
- Duplicate sheet and cell pairs across inputs and outputs after normalization.
- Range constraints that include non-numeric minimum or maximum values.
- Imported files missing required arrays (inputs or outputs) while still containing metadata.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The codebase MUST expose configuration data types and validation helpers from `src/shared` so they can be reused outside the admin portal bundle.
- **FR-002**: The shared validation helpers MUST accept raw JSON text and return either a normalized configuration payload or structured error messages without depending on browser APIs.
- **FR-003**: The admin portal MUST consume the shared helpers without regressing current import, normalization, or error reporting behavior.
- **FR-004**: The refactor MUST keep the configuration schema contract intact, including supported constraint types, version tags, and metadata requirements.
- **FR-005**: The repository MUST include brief usage notes outlining which shared modules support JSON import and which UI utilities remain frontend-only.

### Key Entities _(include if feature involves data)_

- **Configuration**: Represents the full set of inputs, outputs, and metadata loaded from JSON; must include arrays of mapping objects plus version metadata.
- **Mapping**: Describes an individual input or output cell, including sheet name, cell ID, label, type, and optional constraint details.
- **Validation Result**: Captures the outcome of running shared validation, returning either a normalized configuration bundle or a list of human-readable errors.

### Assumptions

- The admin portal remains the single source for exporting configuration files during this phase.
- Only schema version `1.0` needs to be supported in the shared helpers for the upcoming engine milestone.
- Future services will handle persistence and execution logic; this refactor only prepares shared parsing and validation logic.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Shared validation helpers process valid configuration files end-to-end in under 1 second for files up to 200 mappings on commodity hardware.
- **SC-002**: Validation error messages remain identical (string match) for at least 95% of previously captured admin portal error scenarios after the refactor.
- **SC-003**: Documentation updates enable a new backend engineer to locate shared configuration modules and run a validation example in under 5 minutes.
- **SC-004**: Admin portal regression tests covering JSON import pass on the first run after the refactor, demonstrating no functional drift.
