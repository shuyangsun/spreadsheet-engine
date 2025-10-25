# Shared Modules

This directory hosts backend-friendly utilities that are safe to consume outside of the admin portal bundle.

## Configuration Import Helpers

- `configuration/types.ts`: Type definitions for configuration metadata, mappings, and validation errors.
- `configuration/transforms.ts`: Pure helpers for normalizing configurations, generating deterministic exports, and converting between export and draft shapes.
- `configuration/validation.ts`: JSON parsing and validation logic that returns structured errors without relying on browser APIs.
- `configuration/identifiers.ts`: Lightweight ID generator used when converting exported snapshots into draft bundles.
- `configuration/configuration.schema.json`: Canonical JSON schema shared across admin portal and calculation engine.
- `configuration/index.ts`: Barrel file that re-exports all configuration helpers plus the JSON schema for convenience.
- `configuration/examples/validate-config.ts`: Small Node-ready sample demonstrating how to combine `configurationSchema` with `validateImportedJson`.

## Frontend-Only Utilities

UI helpers such as the `cn` class name merger remain under `src/prototype/admin-portal/**/src/lib` and should not be imported by backend services.
