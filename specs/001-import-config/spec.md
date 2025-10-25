# Feature Specification: Import JSON Configurations

**Feature Branch**: `001-import-config`
**Created**: October 24, 2025
**Status**: Draft
**Input**: User description: "Now that the prototype for exporting spreadsheet mapping to JSON files GUI is done, I want to be able to add the functionality to import a previously exported JSON file and populate fields on GUI based on the config. This way, the user can configure on top of a previously configured file. Note that when a JSON file is imported, if the new configuration changed anything to make the content not identical, the version of the new exported JSON should automatically increase. No need to specify where the import button will be on the GUI yet, that is implementation detail we can worry about later. Keep requirements clear and concise. Remember, I'm poor, I can't afford too many tokens."

## Clarifications

### Session 2025-10-24

- Q: How should the system handle imports when unsaved edits exist in the current configuration? → A: Display a confirmation that lets the administrator cancel the import, download the current JSON configuration, or discard the in-progress edits before continuing.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Resume Configuration from Imported JSON (Priority: P1)

An administrator who previously exported a configuration opens the Admin Portal and imports that JSON file to continue work. They expect the UI to repopulate inputs, outputs, data types, constraints, and metadata exactly as saved so they can pick up where they left off without manual re-entry.

**Why this priority**: Importing prior work is the foundation for iterating on configurations and prevents data loss, making it core to the feature value.

**Independent Test**: Can be tested by exporting a known configuration, clearing the UI, importing the JSON file, and confirming all fields render identically to the saved state.

**Acceptance Scenarios**:

1. **Given** the administrator has a valid exported configuration file, **When** they import the JSON, **Then** the system confirms success and repopulates all mapping fields, data types, constraints, labels, and metadata identically to the saved state.
2. **Given** the administrator imports a configuration containing both inputs and outputs, **When** the UI renders the data, **Then** inputs and outputs appear in their respective sections with their previous collapsed/expanded state defaulting to the product standard for first load.
3. **Given** the administrator imports a configuration that included draft data in local storage, **When** the system loads the file, **Then** previously stored local drafts are replaced by the imported configuration baseline and the user is informed.
4. **Given** the administrator imports a configuration, **When** they navigate through the UI, **Then** all editing controls remain available so the configuration can be updated immediately.
5. **Given** the administrator has unsaved edits in the current session, **When** they attempt to import a JSON file, **Then** the system displays a confirmation that offers options to cancel the import, download the current configuration, or discard the unsaved edits before proceeding.

---

### User Story 2 - Maintain Version Integrity After Import (Priority: P2)

After importing a configuration, the administrator may edit parameters and export again. They need assurance that if the resulting configuration differs from the imported file, the export increases the version number, while unchanged exports preserve the original version so downstream systems can detect revisions.

**Why this priority**: Accurate versioning prevents overwriting validated configurations and signals downstream systems when updates occur.

**Independent Test**: Can be tested by importing a configuration with a known version, exporting immediately to confirm the version is unchanged, editing a field, exporting again, and verifying the version increments by one.

**Acceptance Scenarios**:

1. **Given** the administrator imports a configuration with version `5`, **When** they export without making changes, **Then** the generated JSON retains version `5`.
2. **Given** the administrator imports version `5` and edits any field, **When** they export, **Then** the generated JSON records version `6` and clearly indicates the increment.
3. **Given** the administrator makes multiple edits before exporting, **When** they export once, **Then** the version increases only once relative to the imported baseline.
4. **Given** the administrator resets the configuration to match the imported state before exporting, **When** they export, **Then** the version remains at the imported value.

---

### User Story 3 - Handle Invalid or Incompatible Imports (Priority: P3)

An administrator may attempt to import a malformed, outdated, or incompatible JSON file. The system must validate the content, explain issues, and refuse to overwrite the current configuration so the administrator can correct the problem without losing work.

**Why this priority**: Clear validation preserves data integrity and minimizes support requests triggered by corrupted or legacy files.

**Independent Test**: Can be tested by attempting imports with malformed JSON, missing required fields, or mismatched schema versions and verifying that each is rejected with actionable feedback while leaving the current state untouched.

**Acceptance Scenarios**:

1. **Given** the administrator selects a file that is not valid JSON, **When** the system attempts import, **Then** it blocks the import and explains the file cannot be parsed.
2. **Given** the administrator selects a JSON file missing mandatory configuration sections, **When** the system validates it, **Then** it rejects the import and lists the missing elements that must be fixed.
3. **Given** the administrator imports a file produced by an unsupported schema version, **When** the system evaluates compatibility, **Then** it stops the import and instructs the user how to obtain a supported export.

---

### Edge Cases

- What happens when the imported file omits a version number or uses a non-numeric value?
- When unsaved edits exist, the system prompts the administrator to confirm the import with options to cancel, download the current JSON, or discard ongoing edits.
- What happens if the imported configuration exceeds current UI limits (e.g., more mappings than supported)?
- How does the system respond when local storage quota prevents saving the new baseline?
- What happens if the imported file references constraint types the prototype does not support?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow administrators to select and load a JSON file produced by the Admin Portal exporter.
- **FR-002**: System MUST validate that the selected file contains well-formed JSON before applying any changes.
- **FR-003**: System MUST verify that mandatory configuration sections (inputs, outputs, metadata including version) are present and structurally correct before import proceeds.
- **FR-004**: System MUST reject invalid or incompatible files and present clear error messaging without altering the current configuration state.
- **FR-005**: System MUST replace the current in-memory configuration and any stored draft with the imported configuration once validation succeeds.
- **FR-006**: System MUST repopulate all UI fields—including labels, cell references, classifications, data types, and constraints—using the imported configuration values.
- **FR-007**: System MUST capture the imported configuration as a baseline snapshot used to detect subsequent changes prior to export.
- **FR-008**: System MUST retain the imported version number and include it in any subsequent export when no changes are detected.
- **FR-009**: System MUST compare the current configuration to the imported baseline and, when differences exist, increment the version number by one during export.
- **FR-010**: System MUST prevent multiple version increments for the same set of edits by updating the baseline snapshot only after a successful export.
- **FR-011**: System MUST inform the administrator when an export keeps the same version versus when it increments, so they understand the change history.
- **FR-012**: System MUST provide a way to cancel an import attempt before confirmation if the administrator selected the wrong file to avoid overwriting the current state.
- **FR-013**: System MUST, when unsaved edits exist, present a confirmation that allows the administrator to cancel the import, download the current configuration as JSON, or discard the edits before continuing with the import.

### Key Entities _(include if feature involves data)_

- **Imported Configuration Baseline**: Serialized representation of the most recently imported configuration, including mappings, constraints, metadata, and version number, used for comparison against in-progress edits.
- **Version Metadata**: Numeric value stored within the configuration that signals revision level; persists across import/export cycles and increments only when exported content differs from the baseline.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of valid Admin Portal exports import successfully on the first attempt without manual corrections.
- **SC-002**: Administrators can import and repopulate a configuration in under 30 seconds from file selection to confirmation.
- **SC-003**: 100% of exports performed after edits to an imported configuration reflect a version number exactly one greater than the imported version.
- **SC-004**: Fewer than 5% of import attempts fail due to user error without receiving an actionable error message guiding resolution.

## Assumptions

- Administrators import JSON files previously generated by the Admin Portal exporter, which always include a numeric `version` field in metadata.
- Administrators operate in modern desktop browsers that support file uploads and provide sufficient local storage for baseline snapshots.
- Editing capabilities available prior to this feature (mapping management, constraint editing, JSON export) remain unchanged and compatible with imported data.
- Only one configuration file is managed at a time; concurrent sessions or multi-user editing are outside the current workflow.

## Out of Scope

- Providing tooling to merge multiple configuration files or compare differences side by side.
- Allowing administrators to manually set or override version numbers outside the automated increment flow.
- Importing configurations directly from external storage services or URLs without using a local file.
