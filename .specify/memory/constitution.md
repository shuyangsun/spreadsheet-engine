# SpreadsheetEngine Constitution

## Core Principles

### 1. Speed over quality when prototyping

When prototyping, produce only the minimal artifacts — prompts, specs, and code — required to validate ideas. Avoid over-engineering: iterate quickly, gather feedback, and refine based on real learning. Keep prototypes simple and reproducible with a minimal tech stack.

For front-end code, always prefer vanilla HTML, CSS, and JavaScript over libraries or frameworks. Prefer embedding CSS and JavaScript directly inside the HTML file.

### 2. Hardcode data when prototyping

When prototyping, always hardcode data whenever possible instead of calling real APIs. If explicitly asked, create a mock service that has the interface of the real API, so it is easier to swap to the real implementation or API calls.

### 3. Simulate latency when prototyping

When prototyping, make a judgment call about whether it is necessary to add a sleep timer to simulate network latencies and provide a more realistic user experience. Some network calls are almost instant and do not require latency simulation (e.g., fetching a username); while other network calls may have latency as long as several seconds (e.g., a call to a batch spreadsheet calculation endpoint).

### 4. Optimize for LLM agents

Design artifacts primarily for consumption by LLMs rather than humans. Structure content to maximize clarity and machine readability, following current best practices for LLM optimization. When uncertain about optimal formats or conventions, research and apply the latest recommendations. For example, as of late 2025, LLMs typically interpret XML and YAML more effectively than JSON.

Do not generate too many tokens when creating specs, I'm poor, I can't pay for them. Keep things clear but concise.

### 5. No testing unless explicitly asked

Do not implement tests or use TDD unless explicitly asked. Testing is definitely not needed during prototyping.

### 6. File organization and dependency boundaries

Source code should be placed under the `src/` directory. The source directory has three subdirectories: `prototype`, `shared`, and `production`. The `prototype` directory contains only prototype code, usually different iterations of the front-end; the `shared` directory contains common elements used by both prototypes and production code, such as interfaces for real and mock services; the `production` directory contains production code only. Direct dependencies across `prototype` and `production` directories are strictly forbidden. If anything needs to be accessed by both, put it in the `shared` directory.

If there are multiple versions of a code component, place each version under the subdirectory `v...`, with `...` being the version number. Note that version directories should be nested under code directories, not the other way around.

### 7. Prototype version control

We would like to preserve all versions of prototypes (especially front-end work), so we can go back and review our progression.

### 8. Use .env file for secrets in production code

Do not hardcode secrets or sensitive information in the code; put them in the `.env` file.

### 9. Use React 19 and React compiler

If React is the library of choice (usually for production code only), use React 19 and the React compiler, which eliminates the need to use `useMemo`, `useCallback`, and `React.memo`. If you are unsure about how to use it since this is relatively new, search the internet.

### 10. Production environment

We will deploy prototypes and production code with GitHub Pages and/or Cloudflare Workers. Make sure both deployment environments are set up properly.

### 11. CSS and branding

When prototyping, keep colors in CSS variables, so it is easier to rebrand later.

## Governance

<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]

<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: 1.0.0 | **Ratified**: 2025-10-23 | **Last Amended**: 2025-10-23
