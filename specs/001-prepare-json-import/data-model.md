# Data Model: Shared Configuration Backend Prep

## Entities

### Configuration

- **Identity**: Implicit by version + combination of mappings; no unique ID in schema.
- **Fields**:
  - `version` (`VersionTag`): String pattern `v<number>`; must match metadata.version.
  - `inputs` (`InputMapping[]`): Non-empty array of input mappings.
  - `outputs` (`OutputMapping[]`): Non-empty array of output mappings.
  - `metadata` (`ConfigurationMetadata`): Required object describing provenance.
  - `schemaVersion` (`string`, optional): When present, must equal `metadata.schemaVersion`.
- **Relationships**: Aggregates `InputMapping`, `OutputMapping`, and `ConfigurationMetadata`.
- **Validation Rules**:
  - Inputs and outputs arrays cannot be empty.
  - Duplicate sheet/cell pairs across inputs and outputs are forbidden after normalization.
  - `version` must match `metadata.version`.

### InputMapping

- **Identity**: `(sheetName.toLowerCase(), cellId.toUpperCase())` per configuration; `id` generated for runtime use only.
- **Fields**:
  - `type`: Literal `"input"`.
  - `sheetName`: Trimmed string, required.
  - `cellId`: Excel-style reference (`^[A-Z]+[0-9]+$`), uppercased.
  - `label`: Non-empty trimmed string.
  - `dataType`: Enum `number | text | percentage | currency | date`.
  - `constraints`: Optional `Constraint`.
- **Validation Rules**:
  - `dataType` is mandatory.
  - Range constraints allowed only for numeric/date data types.
  - Discrete constraints must contain at least one non-empty value.

### OutputMapping

- **Identity**: `(sheetName.toLowerCase(), cellId.toUpperCase())` per configuration; `id` generated for runtime use only.
- **Fields**:
  - `type`: Literal `"output"`.
  - `sheetName`: Trimmed string, required.
  - `cellId`: Excel-style reference (`^[A-Z]+[0-9]+$`), uppercased.
  - `label`: Non-empty trimmed string.
- **Validation Rules**:
  - Must not include `dataType` or `constraints` properties.

### Constraint

- **Variants**:
  - `discrete`: `values` array of trimmed, non-empty strings (at least one).
  - `range`: Numeric `min` and `max`; both required when provided, `min ≤ max`.
- **Usage**: Only allowed on `InputMapping` records.

### ConfigurationMetadata

- **Fields**:
  - `createdAt`: ISO 8601 timestamp string.
  - `updatedAt`: ISO 8601 timestamp string or `null`.
  - `version`: `VersionTag` (`v<number>`), required.
  - `schemaVersion`: Optional non-empty string (when present must match root `schemaVersion`).
  - `source`: Optional string (e.g., system name).
- **Validation Rules**:
  - `createdAt` required; `updatedAt` optional but if provided must be string or null.
  - `version` required and synchronized with configuration version.

## State Transitions

- `ExportConfiguration` → `DraftConfiguration`: Use `draftFromExportConfiguration`; assigns new `id` values via `createId` while normalizing schema metadata.
- `DraftConfiguration` → `ExportConfiguration`: Use `normalizeExportConfiguration`; trims text fields, sorts mappings, and enforces canonical metadata structure.

## Volume & Scale Assumptions

- Designed for configurations up to ~200 mappings processed in under 1 second (SC-001).
- Current storage is transient (in-memory or localStorage); no persistence model required for shared module.
