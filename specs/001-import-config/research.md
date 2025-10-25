# Research Findings – Import JSON Configurations

## Decision 1: File import UX pattern

- **Decision**: Trigger a hidden `<input type="file">` from a new "Import" button placed beside the "Configuration" title.
- **Rationale**: Keeps layout consistent with current badge/download controls and satisfies the user request to position the control in that header area.
- **Alternatives considered**: Modal-only launch (adds extra step without benefit); drag-and-drop zone (larger layout change and not requested).

## Decision 2: JSON parsing implementation

- **Decision**: Use the browser `FileReader` API to read the selected file as text, then `JSON.parse` with schema validation via existing Zod validators.
- **Rationale**: Works offline, reuses validation tooling already used for export checks, and avoids adding dependencies.
- **Alternatives considered**: Streaming parser (unnecessary for small files); server-side validation (prototype prohibits backend calls).

## Decision 3: Baseline change detection

- **Decision**: Store the imported configuration snapshot separately (e.g., `importBaseline`) and compare it to the current draft using deep equality on the normalized export payload just before download.
- **Rationale**: Guarantees version increments only when exported data diverges from the imported snapshot and avoids false positives from transient UI state.
- **Alternatives considered**: String comparison of raw JSON (sensitive to whitespace/order); per-field dirty flags (more bookkeeping, risk inconsistency).

## Decision 4: Unsaved edits confirmation

- **Decision**: When unsaved edits exist, open an `AlertDialog` offering "Cancel", "Download current config", and "Discard edits" before proceeding with file selection.
- **Rationale**: Reuses shadcn/ui components already in the project, satisfies specification, and minimizes new UI patterns.
- **Alternatives considered**: Custom inline banner (less intrusive but fails to block accidental import); browser `confirm()` (inconsistent styling, fewer action options).
