# Implementation Plan: Calculation Engine Prototype

**Branch**: `[001-prototype-calc-engine]` | **Date**: 2025-10-25 | **Spec**: [specs/001-prototype-calc-engine/spec.md](specs/001-prototype-calc-engine/spec.md)
**Input**: Feature specification from `/specs/001-prototype-calc-engine/spec.md`

## Summary

Create a front-end-only calculation engine prototype that loads a JSON configuration and a Google Sheet link, enforces configured constraints, surfaces outputs, and offers single-variable exploration using hardcoded data. The UI must leverage shadcn components with the same color theme as the existing admin portal prototype while remaining layout-flexible for the new workflow.

## Technical Context

**Language/Version**: TypeScript 5.9 (React 19 with Vite)
**Primary Dependencies**: React 19, shadcn/ui, Tailwind CSS with shared theme tokens, react-hook-form, lucide-react icons
**Storage**: N/A (all state in-memory on the client)
**Testing**: None (per constitution principle 5 for prototypes)
**Target Platform**: Modern desktop browsers (Chromium, Firefox, Safari)
**Project Type**: Web prototype (single-page application)
**Performance Goals**: Meet spec success criteria (inputs ready ≤5s including simulated latency; output refresh ≤2s; exploration plot ≤3s)
**Constraints**: Hardcode data; simulate latency for sheet fetch; reuse admin portal color theme; no backend calls
**Scale/Scope**: Single analyst workflow; one page with supporting components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Principle 1 (Prototype speed)**: Using shadcn with React 19 aligns with allowed exception when it accelerates work while reusing existing theme tokens → Pass.
- **Principle 2 (Hardcode data)**: Plan keeps all configuration, sheet data, and outputs bundled locally → Pass.
- **Principle 3 (Simulate latency)**: Sheet fetch stub will include configurable delay → Pass.
- **Principle 4 (Optimize for LLM agents)**: Documentation to be concise, structured Markdown with explicit sections → Pass.
- **Principle 5 (No testing)**: No automated tests planned → Pass.
- **Principle 6 (Directory boundaries)**: Work confined to `src/prototype/calculation-engine/v1-gpt-5-codex/` with shared tokens referenced read-only → Pass.
- **Principle 11 (CSS branding)**: Theme variables reused from admin portal prototype → Pass.
- **Post-Design Check**: Phase 1 artifacts (data model, contracts, quickstart) maintain the same compliance posture; no new exceptions introduced → Pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-prototype-calc-engine/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md  # Generated later by /speckit.tasks
```

### Source Code (repository root)

```text
src/
└── prototype/
    └── calculation-engine/
        └── v0-gpt-5-codex/
            ├── index.html
            ├── public/
            │   └── theme-tokens.json
            └── src/
                ├── app.tsx
                ├── components/
                ├── hooks/
                ├── lib/
                └── styles/

shared/
└── configuration/
    └── configuration.schema.json  # referenced read-only
```

**Structure Decision**: Extend the existing prototype tree with a new `v0-gpt-5-codex` variant dedicated to the calculation engine. Components/hooks/libs mirror the admin portal prototype organization to maximize theme reuse while keeping prototype code isolated from production.

## Complexity Tracking

> No constitution violations detected; table not required.
