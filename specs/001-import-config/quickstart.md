# Quickstart – Import JSON Configurations

## Prerequisites

- Node.js 20+
- `npm install` already run inside `src/prototype/admin-portal/v1-gpt-5-codex`

## Run the prototype

```bash
cd src/prototype/admin-portal/v1-gpt-5-codex
npm run dev
```

Open `http://localhost:5173` in a desktop browser.

## Implementation checklist

1. Add an "Import" button next to the "Configuration" title inside `App.tsx`; hook it to a hidden `<input type="file">`.
2. Create state for `importBaseline` (snapshot + metadata) and expose helpers in `src/lib/storage.ts` for persistence if needed.
3. Parse the selected file with `FileReader`, validate via existing Zod schema (`toExportConfiguration` / `validateConfiguration`), and map into current state using existing types.
4. Before applying import, show an `AlertDialog` when unsaved edits exist, offering cancel, download current JSON, or discard edits.
5. Recompute preview JSON and validation after import; update toast notifications for success/failure cases.
6. On export, compare the normalized payload with the stored baseline to decide whether to increment the version.

## Manual validation

- Import a known-good JSON; verify UI repopulates and badge reflects validation state.
- Modify any field and export; confirm version increments exactly once.
- Import again without changes; export immediately and verify version is unchanged.
- Attempt to import malformed JSON and confirm descriptive error toast plus state safety.
- With unsaved edits, trigger import; ensure the confirmation offers cancel, download, and discard paths.
