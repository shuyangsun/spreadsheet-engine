# Quickstart: Shared Configuration Backend Prep

1. **Install dependencies** (if not already): run `npm install` inside `src/prototype/admin-portal/v1-gpt-5-codex` to ensure TypeScript build picks up path aliases.
2. **Import shared helpers**:
   - Use `import { validateImportedJson } from "@shared/configuration";` in backend-capable modules.
   - Re-export types in UI bundles via `@/lib/types` to avoid duplicate definitions.
3. **Load the canonical schema** when non-TypeScript validation is needed:
   - Read `src/shared/configuration/configuration.schema.json` and apply a JSON Schema validator (AJV or similar) prior to calling business logic.
4. **Normalize configurations**:
   - Use `normalizeExportConfiguration` before persistence or download to enforce trimmed, sorted payloads.
   - Use `draftFromExportConfiguration` when initializing editable state; inject a deterministic ID factory for tests if required.
5. **Validate drafts**:
   - Call `validateConfiguration` on in-memory drafts to surface cell duplication, missing labels, or invalid constraints.
6. **Document consumers**:
   - Update project READMEs to reference the shared module instead of legacy `@/lib` helpers, ensuring future teams know the canonical entry point.
