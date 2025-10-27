# spreadsheet-engine Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-23

## Active Technologies
- TypeScript 5.9 + React 19 (Vite) + shadcn/ui (Radix primitives), react-hook-form, zod, lucide-reac (001-import-config)
- Browser localStorage draft persistence (existing) (001-import-config)
- TypeScript 5.9 (browser + Node-compatible) + Built-in TypeScript tooling, Vite bundler (alias support), optional JSON Schema validator (e.g., AJV) for consumers (001-prepare-json-import)
- N/A (in-memory plus browser localStorage usage remains in admin portal) (001-prepare-json-import)
- TypeScript 5.9 targeting Node.js 20 LTS + Express 5, `googleapis` (Drive v3 + Sheets v4 clients), Multer for streaming uploads, Zod for request validation, Prisma ORM for PostgreSQL access, Pino for structured logging (001-sheet-conversion-backend)
- PostgreSQL 15 (audit log tables for conversions and executions) (001-sheet-conversion-backend)

- Vanilla HTML5, CSS3, JavaScript (ES6+) + None (single HTML file with embedded CSS/JS per constitution) (001-admin-portal-prototype)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

Vanilla HTML5, CSS3, JavaScript (ES6+): Follow standard conventions

## Recent Changes
- 001-sheet-conversion-backend: Added TypeScript 5.9 targeting Node.js 20 LTS + Express 5, `googleapis` (Drive v3 + Sheets v4 clients), Multer for streaming uploads, Zod for request validation, Prisma ORM for PostgreSQL access, Pino for structured logging
- 001-prepare-json-import: Added TypeScript 5.9 (browser + Node-compatible) + Built-in TypeScript tooling, Vite bundler (alias support), optional JSON Schema validator (e.g., AJV) for consumers
- 001-import-config: Added TypeScript 5.9 + React 19 (Vite) + shadcn/ui (Radix primitives), react-hook-form, zod, lucide-reac


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
