# Implementation Plan: Admin Portal Prototype v0

**Branch**: `001-admin-portal-prototype` | **Date**: October 23, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-admin-portal-prototype/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a proof-of-concept front-end prototype for the Admin Portal that allows administrators to configure spreadsheet inputs and outputs by mapping named cells, defining data types, and setting constraints. The prototype validates the UX approach using vanilla HTML/CSS/JavaScript with hardcoded/mocked data, following enterprise design system patterns in a single-page layout with compact, expandable views. All code will be placed under `src/prototype/admin-portal/v0`.

## Technical Context

**Language/Version**: Vanilla HTML5, CSS3, JavaScript (ES6+)
**Primary Dependencies**: None (single HTML file with embedded CSS/JS per constitution)
**Storage**: Browser LocalStorage for draft persistence (mocked data for demonstration)
**Testing**: Not required (per constitution - no testing for prototypes)
**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge) - 1024px+ width
**Project Type**: Single-file web prototype
**Performance Goals**: <200ms visual feedback for all user actions, support 50+ mappings without lag
**Constraints**: Single-page layout, proof-of-concept only (UX validation), no backend/API calls
**Scale/Scope**: Single administrator interface, approximately 500-800 lines of code in single HTML file## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                          | Compliance | Notes                                                           |
| -------------------------------------------------- | ---------- | --------------------------------------------------------------- |
| **1. Speed over quality when prototyping**         | ✅ PASS    | Using vanilla HTML/CSS/JS in single file, minimal tech stack    |
| **2. Hardcode data when prototyping**              | ✅ PASS    | All data hardcoded/mocked, no API calls                         |
| **3. Simulate latency when prototyping**           | ✅ PASS    | No network calls needed for this prototype (local storage only) |
| **4. Optimize for LLM agents**                     | ✅ PASS    | Documentation structured for clarity                            |
| **5. No testing unless explicitly asked**          | ✅ PASS    | No tests implemented                                            |
| **6. File organization and dependency boundaries** | ✅ PASS    | Code placed in `src/prototype/admin-portal/v0/`                 |
| **7. Prototype version control**                   | ✅ PASS    | Version v0 explicitly tracked in directory structure            |
| **8. Use .env file for secrets**                   | N/A        | No secrets in prototype                                         |
| **9. Use React 19 and React compiler**             | N/A        | Not using React (vanilla JS per constitution for prototypes)    |
| **10. Production environment**                     | N/A        | Prototype only, not for production deployment                   |

**Status**: ✅ ALL GATES PASSED - Ready to proceed with Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-portal-prototype/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── configuration-schema.json  # JSON schema for exported configuration
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── prototype/
│   └── admin-portal/
│       └── v0/
│           └── index.html    # Single-file prototype with embedded CSS/JS
├── shared/                   # (not used in this prototype)
└── production/               # (not used in this prototype)
```

**Structure Decision**: Single-file prototype approach following constitution principle #1 (speed over quality when prototyping) and #6 (file organization). The entire prototype is contained in one HTML file with embedded CSS and JavaScript, placed under `src/prototype/admin-portal/v0/` to maintain version history per constitution principle #7.

## Complexity Tracking

> **No violations** - All constitution principles are satisfied for this prototype.

## Phase 0: Research Complete ✅

**Output**: `research.md`

**Summary**: All technical unknowns resolved:

- Enterprise design system: Material Design 3 principles adapted for vanilla CSS
- Layout pattern: Vertical scroll with sticky header and fixed action bar
- Expandable UI: Native HTML `<details>`/`<summary>` elements
- Validation approach: Simple form validation on submit/export only
- Storage: LocalStorage with debounced auto-save
- Data format: JSON schema defined
- Sample data: Loan calculator example pre-populated

## Phase 1: Design & Contracts Complete ✅

**Outputs**:

- `data-model.md` - Complete entity definitions and relationships
- `contracts/configuration-schema.json` - JSON Schema for exported configuration
- `quickstart.md` - User guide and usage instructions
- `.github/copilot-instructions.md` - Agent context updated

**Summary**: Data model and contracts finalized:

- 4 core entities: CellMapping, Constraint, Configuration, Metadata
- Validation rules for all entities
- JSON Schema with full validation constraints
- Clear data flow for loading, editing, and exporting
- Sample data structure documented

**Constitution Re-check**: ✅ All gates still passing post-design

## Phase 2: Task Breakdown

**Status**: ⏸️ Not started (requires `/speckit.tasks` command)

The `/speckit.plan` command ends here. To generate implementation tasks, run:

```bash
/speckit.tasks
```

## Summary

**Branch**: `001-admin-portal-prototype`
**Implementation Path**: `src/prototype/admin-portal/v0/index.html`

**Key Decisions**:

1. Single HTML file with embedded CSS/JS (per constitution)
2. Material Design 3 visual principles for enterprise intuitiveness
3. Hardcoded sample data for immediate demonstration
4. LocalStorage for draft persistence (no backend)
5. Native HTML elements where possible (details/summary for expand/collapse)

**Artifacts Generated**:

- ✅ `plan.md` - This implementation plan
- ✅ `research.md` - Technical decisions and rationale
- ✅ `data-model.md` - Entity definitions and validation rules
- ✅ `contracts/configuration-schema.json` - JSON Schema
- ✅ `quickstart.md` - User guide
- ✅ `.github/copilot-instructions.md` - Agent context updated

**Next Command**: `/speckit.tasks` to generate implementation task breakdown
