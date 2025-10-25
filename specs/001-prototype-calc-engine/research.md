# Research Findings

- Decision: Reuse admin portal shadcn theme tokens for the calculation engine prototype.

  - Rationale: Guarantees visual alignment across prototypes while avoiding new design exploration.
  - Alternatives considered: Create a fresh theme (rejected: slower, risks branding drift); adopt generic shadcn defaults (rejected: inconsistent colors).

- Decision: Bundle simulated Google Sheet data as static JSON seeded in the prototype.

  - Rationale: Meets constitution mandate to hardcode data and enables deterministic demos without network calls.
  - Alternatives considered: Live Google Sheets API (rejected: violates prototype boundaries); mock server endpoint (rejected: unnecessary infrastructure).

- Decision: Implement latency simulation using a configurable timeout wrapper around the sheet load flow.
  - Rationale: Provides realistic UX expectations and aligns with constitution principle 3.
  - Alternatives considered: Instant responses (rejected: hides real-world delay); network throttling via devtools (rejected: manual and inconsistent).
