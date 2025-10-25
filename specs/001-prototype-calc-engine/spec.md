# Feature Specification: Calculation Engine Prototype

**Feature Branch**: `[001-prototype-calc-engine]`
**Created**: 2025-10-25
**Status**: Draft
**Input**: User description: "Write specs for prototyping the calculation engine project. Only write functional requirements for the front-end, not the backend. Rememeber, this is only the prototyping phase, so do not write any spec about what the GUI will look like, only write functional requirements, the GUI can be flexible and implemented later.

The calculation engine page should be able to take in two inputs: a JSON configuration file and a link to a Google sheet. Based on the config and Google sheet, the GUI should be able to show inputs for input cell mappings, satisfying contraints if present; it should also be able to show outputs after the user provide input values. The page should also be able to display a set of outputs given a set of values for an input (based on constraints if present), this can be a simple x-y plot. Do not worry about plotting for two variables for now, we will worry about that later.

Remember, this is only a prototype, so hardcode EVERYTHING. Simulate real Google sheet API calls if necessary and add latency simulation when it makes sense, but do not actually call any API. However, the imported JSON config should be real and real input and output values in the JSON config should be displayed on the GUI.

The prototype code should live in `src/prototype/calculation-engine`."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Load Config and Sheet Context (Priority: P1)

An operations analyst loads a JSON configuration file and provides a Google Sheet link so the prototype can stage simulated data for review.

**Why this priority**: Without a successfully loaded configuration and sheet context, no other interactions provide value.

**Independent Test**: Upload the provided sample configuration and enter the stubbed sheet link; confirm mappings render and the flow can proceed without touching downstream features.

**Acceptance Scenarios**:

1. **Given** the analyst has a configuration file that conforms to the prototype schema and a sheet link, **When** they select the JSON file, provide the link, and confirm load, **Then** the prototype validates both inputs, simulates a sheet fetch with progress feedback, and reveals the list of configured inputs with default values.
2. **Given** the analyst uploads a configuration that is missing required sections, **When** they attempt to load it, **Then** the prototype blocks progression and displays a descriptive error listing the missing fields.

---

### User Story 2 - Capture Inputs and View Outputs (Priority: P2)

An analyst reviews each configured input, adjusts values within allowed constraints, and observes the resulting outputs drawn from the configuration.

**Why this priority**: The ability to see how inputs influence outputs is the core objective of the prototype once resources are loaded.

**Independent Test**: With the sample configuration preloaded, adjust a single input value, submit, and confirm outputs refresh using only local behavior.

**Acceptance Scenarios**:

1. **Given** all required inputs are displayed with defaults, **When** the analyst edits values that remain within constraints and submits, **Then** the prototype recalculates using its stubbed logic and refreshes the output summary without errors.
2. **Given** an analyst enters a value outside the allowed range, **When** they attempt to submit, **Then** the prototype rejects the action, highlights the invalid field, and explains the violated constraint.

---

### User Story 3 - Explore Single-Variable Output Range (Priority: P3)

An analyst experiments with a single input variable by sweeping through its permitted range to understand how outputs respond, viewing a quick single-variable plot.

**Why this priority**: Exploring sensitivity across one variable enables richer insight during discovery without requiring backend support.

**Independent Test**: Select one configured input, request the exploration view, and verify the simulated dataset and plot render using only hardcoded data.

**Acceptance Scenarios**:

1. **Given** a configuration is loaded and inputs are valid, **When** the analyst selects a variable for exploration and confirms, **Then** the prototype synthesizes a set of sample values within constraints, displays the outputs in a tabular summary, and renders a simple x-y plot reflecting the dataset.

---

### Edge Cases

- Invalid or malformed JSON configuration is uploaded, triggering schema validation errors before any simulated sheet fetch begins.
- The analyst supplies an empty or unsupported Google Sheet link, so the prototype falls back to its default stub data and communicates that a simulation is being used.
- Configured constraints define an empty permissible range, prompting the prototype to warn the user and disable submission until the config is corrected.
- A user retries the load flow while a simulated latency cycle is in progress, ensuring the prototype cancels the prior attempt and restarts cleanly.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The prototype MUST allow users to browse for and load a local JSON configuration file, validating it against the expected structure before proceeding.
- **FR-002**: The prototype MUST display human-readable validation errors when the configuration file is missing required sections, fields, or value types.
- **FR-003**: The prototype MUST accept a Google Sheet link input and simulate a fetch using seeded sheet data while presenting a visible latency indicator of at least two seconds.
- **FR-004**: After both resources are accepted, the prototype MUST render every configured input mapping with prefilled values sourced from the configuration or simulated sheet snapshot.
- **FR-005**: The prototype MUST enforce constraints defined in the configuration (e.g., minimum/maximum values, allowed enumerations) and prevent submission until all inputs comply.
- **FR-006**: The prototype MUST allow users to substitute input values with selections from the simulated sheet data, immediately reflecting the chosen value in the input mapping.
- **FR-007**: Upon submission of valid inputs, the prototype MUST compute and display the configured outputs using deterministic, hardcoded logic tied to the configuration file.
- **FR-008**: The prototype MUST present outputs in both textual form and, when applicable, highlight any constraint-driven notes supplied by the configuration.
- **FR-009**: The prototype MUST provide a single-variable exploration mode that generates at least five evenly spaced sample values within the selected input’s constraints and derives corresponding outputs.
- **FR-010**: The prototype MUST visualize the exploration dataset as a simple x-y plot and list the underlying numeric values so testers can validate the chart.
- **FR-011**: All prototype assets MUST reside within `src/prototype/calculation-engine`, keeping the implementation isolated from production code paths.
- **FR-012**: The prototype MUST build its interface with shadcn UI components and match the color theme used in `src/prototype/admin-portal/v1-gpt-5-codex`, while permitting layout differences appropriate to the calculation workflow.

### Key Entities _(include if feature involves data)_

- **Prototype Configuration**: Represents the uploaded JSON file containing input definitions, constraints, output descriptions, and any sample result sets the prototype should echo.
- **Simulated Sheet Snapshot**: Represents the hardcoded dataset that mimics values retrieved from the referenced Google Sheet, keyed by column identifiers for mapping.
- **Input Mapping Instance**: Represents the pairing of a configuration-defined input with its current value (default, user-entered, or selected from the simulated sheet) and validation state.
- **Output Scenario**: Represents the collection of outputs generated for the current input set, including metadata for notes, constraint warnings, and exploration samples.

## Assumptions

- The JSON configuration follows the structure defined in the existing shared configuration schema, with only the fields required by the prototype enforced.
- The simulated Google Sheet content is bundled with the prototype and updated manually alongside the configuration file.
- No authentication or real network calls are required; all latency is front-end simulation to mimic asynchronous behavior.
- Only one analyst works with the prototype at a time, so no state persistence or multi-user coordination is needed.
- Single-variable exploration is sufficient for this iteration; multi-variable plotting is intentionally out of scope.
- The prototype leverages the shadcn design system assets already established in the admin portal prototype to expedite styling alignment.

## Clarifications

### Session 2025-10-25

- Q: Which design system and theme should the prototype adopt? → A: Use shadcn components with the same color theme as `src/prototype/admin-portal/v1-gpt-5-codex`, adapting layout as needed for the calculation engine page.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A valid configuration and sheet link combination produces a ready-to-edit input mapping view within 5 seconds of the user initiating the load (including simulated latency).
- **SC-002**: 100% of invalid configuration or input entries generate inline guidance that prevents progression until the issue is resolved.
- **SC-003**: After valid inputs are submitted, refreshed outputs appear in under 2 seconds for at least 95% of observed interactions during testing.
- **SC-004**: Single-variable exploration displays at least five sample points that span the full allowed range and renders the chart within 3 seconds of the user request.
