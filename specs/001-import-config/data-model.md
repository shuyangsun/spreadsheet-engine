# Data Model – Import JSON Configurations

## Entities

### DraftConfiguration

- **fields**:
  - `version` (string) – semantic version field shown in UI
  - `inputs` (InputMapping[]) – ordered list of input mappings
  - `outputs` (OutputMapping[]) – ordered list of output mappings
  - `metadata` (ConfigMetadata) – timestamps, version tag
- **notes**: corresponds to active working copy in state and localStorage

### ImportedBaseline

- **fields**:
  - `snapshot` (ExportConfiguration) – normalized export payload captured immediately after import
  - `importedAt` (ISO timestamp string)
  - `sourceFileName` (string)
- **notes**: persisted in memory/localStorage to detect divergence and drive confirmations

### ExportConfiguration

- **fields**:
  - `version` (string) – serialized version label (e.g., "v6")
  - `inputs` (ExportMapping[]) – normalized shape consumed by engine
  - `outputs` (ExportMapping[])
  - `metadata` (ConfigMetadata)
- **notes**: produced by `toExportConfiguration` helper

### Mapping (shared structure)

- **fields**:
  - `id` (string) – unique identifier
  - `type` ("input" | "output")
  - `sheetName` (string)
  - `cellId` (string)
  - `label` (string)
  - `dataType` (string | null)
  - `constraints` (Constraint | null)
- **notes**: InputMapping and OutputMapping reuse this signature; only inputs use constraints

### Constraint

- **variants**:
  - `discrete` – string[] values
  - `range` – { `min`: number | null, `max`: number | null }
- **rules**: discrete and range are mutually exclusive per mapping

### ConfigMetadata

- **fields**:
  - `createdAt` (ISO timestamp string)
  - `updatedAt` (ISO timestamp string | null)
  - `version` (string) – `v<number>` format

## Relationships

- `DraftConfiguration` references the current `ImportedBaseline` for comparison; equality is evaluated via normalized `ExportConfiguration` objects.
- LocalStorage persists both `DraftConfiguration` and `ImportedBaseline` bundles under separate keys to survive reloads.

## State Transitions

- **Import**: Valid JSON → parsed `ExportConfiguration` → converted to `DraftConfiguration`; baseline snapshot captured simultaneously.
- **Edit**: User actions mutate `DraftConfiguration`; baseline remains unchanged until export succeeds.
- **Export w/o changes**: Normalized export equals baseline → version preserved → baseline timestamp refreshed.
- **Export after edits**: Normalized export differs → version incremented → new baseline snapshot replaces prior copy.
- **Discard edits via confirmation**: Restore `DraftConfiguration` from baseline snapshot before proceeding with new import.
