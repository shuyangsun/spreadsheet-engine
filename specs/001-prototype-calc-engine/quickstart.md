# Quickstart

## Prerequisites

- Node.js 20+
- npm 10+

## Setup Steps

1. Navigate to the repository root.
2. Install dependencies from the admin portal prototype to reuse shared shadcn setup:

   ```bash
   cd src/prototype/admin-portal/v1-gpt-5-codex
   npm install
   ```

3. Copy the `tailwind.config.js`, `postcss.config.js`, and shared theme token files as read-only references for the calculation engine prototype (script to be provided during implementation).
4. Return to the repository root and launch the calculation engine prototype dev server once created:

   ```bash
   cd src/prototype/calculation-engine/v1-gpt-5-codex
   npm run dev
   ```

## Using the Prototype

1. Load the bundled sample configuration JSON when prompted.
2. Paste the provided Google Sheet stub link (documented in `lib/sample-data.ts`).
3. Wait for the simulated latency indicator to complete (~2 seconds) and review auto-filled inputs.
4. Adjust input values within the allowed constraints and submit to refresh outputs.
5. Open the exploration mode, select a single input, and generate the x-y plot.
