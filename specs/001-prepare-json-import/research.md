# Research Summary

## Decision: Consolidate configuration logic under `src/shared/configuration`

- **Rationale**: Existing TypeScript modules already provide type definitions, transforms, and validation that are browser-agnostic. Keeping them in one shared package minimizes refactor effort while satisfying constitution rule 6 on dependency boundaries.
- **Alternatives considered**:
  - Continue duplicating logic inside the admin portal bundle (rejected: violates shared reuse goals, risks drift).
  - Extract logic into an external NPM package (rejected: overkill for current scope and adds publishing overhead).

## Decision: Author canonical JSON schema `configuration.schema.json`

- **Rationale**: A single JSON schema keeps admin portal exports and the upcoming calculation engine aligned. It enables validation in environments that cannot compile TypeScript and fulfills FR-006.
- **Alternatives considered**:
  - Rely solely on TypeScript types for validation (rejected: downstream services may not use TS runtime tooling).
  - Maintain separate schemas per project (rejected: increases drift risk).

## Decision: Expose shared utilities via path alias `@shared/configuration`

- **Rationale**: Existing Vite/TS config already added the alias, enabling both front-end and future backend projects to import without relative paths. Keeps integration lightweight while respecting constitution structure rules.
- **Alternatives considered**:
  - Relative imports (`../../../shared/...`) (rejected: brittle and hurts readability).
  - Publish as compiled JS bundle (rejected: unnecessary for repo-internal reuse).
