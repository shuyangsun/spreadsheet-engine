# Admin Portal Import Prototype

Admin Portal prototype (`v1-gpt-5-codex`) now supports importing JSON configurations alongside the existing export flow. The feature set focuses on protecting in-progress edits, preserving version integrity, and blocking incompatible payloads.

## Getting started

```bash
cd src/prototype/admin-portal/v1-gpt-5-codex
npm install
npm run dev
```

Then open <http://localhost:5173> in a desktop browser.

## Import workflow

- Use the Import button beside the Configuration heading; the hidden file input accepts `application/json` exports from this prototype.
- When unsaved edits exist, an alert dialog offers Cancel, Download current JSON, or Discard edits before the file picker opens.
- Successful imports repopulate mappings, metadata, and baseline storage; the preview JSON and validation badge refresh instantly.
- Validation failures surface a descriptive toast summarising the first few issues while leaving the current configuration untouched.
- Schema compatibility is enforced before state changes so unsupported payloads never overwrite drafts.

## Version and schema handling

- Imported payloads establish a baseline snapshot; exports compare the normalized payload against that baseline to decide whether to increment the version tag.
- The importer captures and persists the schema version supplied by the file. Files without a schema version default to `1.0` for future comparisons.
- Only schema version `1.0` is supported. Files created by newer schemas are rejected with guidance to re-export from a compatible Admin Portal build.

## Failure messaging

- Toasts summarise up to three validation errors with a count of remaining issues so administrators know what requires attention.
- Output mappings that include `dataType` or `constraints` metadata are rejected with explicit messages, ensuring metadata rules stay consistent.
- File read failures and JSON parse errors are surfaced without mutating local state, enabling a retry without losing work.

## Manual validation log

| Scenario                                        | Status  | Notes                                                                  |
| ----------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| Import valid JSON and repopulate UI             | Pending | Run through browser once sample export is available.                   |
| Export immediately after import retains version | Pending | Verify version stays constant when no edits occur.                     |
| Edit then export increments version once        | Pending | Confirm single increment relative to imported baseline.                |
| Import malformed JSON                           | Pending | Expect destructive toast with parse guidance, no state changes.        |
| Import with unsupported schema version          | Pending | Ensure the new guard blocks the import and provides remediation steps. |

Follow-ups: execute the pending scenarios during QA and capture screenshots or recordings for documentation once confirmed.
