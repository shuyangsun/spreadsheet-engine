# Implementation Plan: Import JSON Configurations

**Branch**: `001-import-config` | **Date**: October 24, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-import-config/spec.md`

## Summary

Extend the Admin Portal prototype (`v1-gpt-5-codex`) so administrators can import previously exported JSON configurations, review a confirmation dialog when unsaved edits exist, repopulate the UI from the imported data, and ensure subsequent exports increment the version automatically when edits diverge from the import baseline. Place the new import control next to the “Configuration” title in the JSON preview panel.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19 (Vite)
**Primary Dependencies**: shadcn/ui (Radix primitives), react-hook-form, zod, lucide-react
**Storage**: Browser localStorage draft persistence (existing)
**Testing**: No automated tests (prototype per constitution)
**Target Platform**: Desktop web (modern browsers)
**Project Type**: Prototype single-page React app
**Performance Goals**: Maintain instant UI feedback (<200 ms interactions per spec)
**Constraints**: Keep prototype lightweight; avoid backend/services; reuse existing state/store patterns
**Scale/Scope**: Single configuration interface; limited to `src/prototype/admin-portal/v1-gpt-5-codex`

## Constitution Check

GATE 1 – Prototype simplicity: Solution stays within existing React prototype and avoids backend or new shared modules ✅

GATE 2 – Hardcoded/mock data only: Import/export operates on local JSON artifacts without external services ✅

GATE 3 – Token discipline: Plan keeps documentation concise and focused per constitution ✅

## Project Structure

### Documentation (this feature)

```text
specs/001-import-config/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md   # generated later by /speckit.tasks
```

### Source Code (repository root)

```text
src/
└── prototype/
    └── admin-portal/
        └── v1-gpt-5-codex/
            ├── public/
            └── src/
                ├── components/
                ├── hooks/
                ├── lib/
                └── App.tsx
```

**Structure Decision**: Implement all changes within the existing prototype path; no new packages or cross-prototype dependencies required.

## Complexity Tracking

No constitution violations identified; tracking table not required.

## Phase 0 – Research Summary

- File import triggered through hidden file input keeps layout intact while placing control beside the "Configuration" heading.
- Browser `FileReader` + `JSON.parse` with existing Zod validators handles local-only imports without new dependencies.
- Store an `importBaseline` snapshot for equality checks; compare normalized export payloads to decide version increments.
- Use shadcn/ui `AlertDialog` to gate imports when unsaved edits exist, offering cancel, download, or discard actions.

## Phase 1 – Design Overview

### UI updates

- Add "Import" button within the configuration header stack in `App.tsx`, paired with hidden file input.
- Introduce confirmation dialog component (reuse existing alert-dialog primitives) rendered conditionally when unsaved edits are detected.

### State & storage

- Extend `DraftConfiguration` state with `importBaseline` metadata (version, source filename, timestamp, serialized snapshot).
- Update `src/lib/storage.ts` helpers to persist/retrieve both draft and baseline so reloads retain provenance.

### Validation & version control

- Convert imported JSON to internal shape via existing utils; on failure show destructive toast and abort state changes.
- During export, compare `toExportConfiguration(currentDraft)` with baseline snapshot; increment version and refresh baseline only when they differ.

## Phase 2 – Implementation Outline

1. **UI wiring** (`src/prototype/admin-portal/v1-gpt-5-codex/src/App.tsx`)
   - Insert "Import" button + hidden file input near configuration title.
   - Capture file selection, handle multiple clicks, and reset input after processing.
2. **Confirmation flow** (`components` directory)
   - Add lightweight wrapper component or inline logic using `AlertDialog` to present cancel / download / discard options when `isDirty` flag is true.
   - Hook "Download" action to existing `handleDownloadJson` helper before aborting import.
3. **State management** (`App.tsx` + `src/lib/storage.ts`)
   - Track `importBaseline` in React state; persist alongside draft configuration in localStorage.
   - Provide helpers to compute dirty state by comparing baseline snapshot to current export payload.
4. **Import handling** (`src/lib/validation.ts` or new util)
   - Parse file text, validate against schema, map into `DraftConfiguration` shape, and surface success/failure toasts.
   - On success, update draft state, baseline snapshot, and reset unsaved flag.
5. **Export adjustments** (`App.tsx`)
   - Before running download, evaluate equality with baseline; when different, increment numeric portion of `metadata.version`, update baseline after download, and persist.
6. **UX polish**
   - Provide status toasts for import success, schema mismatch, and cancelled operations.
   - Ensure badge state and scroll area refresh correctly after import.

## Post-Design Constitution Check

Revalidated compliance: all work remains prototype-scoped, uses hardcoded/local data, and documentation stays concise ➜ ✅ Ready for task breakdown.
