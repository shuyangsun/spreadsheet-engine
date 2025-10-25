# Data Model Overview

## Prototype Configuration

- **configId**: string (unique identifier within prototype bundle)
- **title**: string (user-facing name of the scenario)
- **inputs**: array of `InputDefinition`
- **outputs**: array of `OutputDefinition`
- **exploration**: optional `ExplorationSpec` (single-variable sweep parameters)

## InputDefinition

- **key**: string (matches configuration schema identifier)
- **label**: string (display name)
- **type**: enum (`number`, `text`, `enum`)
- **defaultValue**: string | number
- **constraints**: `Constraints` block (min/max, allowedValues, step)
- **sheetMapping**: optional `SheetMapping` reference for auto-fill

## Constraints

- **min**: number (inclusive lower bound)
- **max**: number (inclusive upper bound)
- **allowedValues**: array of `string | number` (mutually exclusive with range)
- **step**: number (resolution for exploration sampling)
- **notes**: string (validation messaging)

## SheetMapping

- **sheetId**: string (identifier for simulated sheet bundle)
- **column**: string (column key to read defaults from)
- **row**: number (row index for default selection)

## OutputDefinition

- **key**: string
- **label**: string
- **description**: string (human-readable summary)
- **calculation**: string (reference to hardcoded formula within prototype)
- **units**: string (display units)
- **notes**: optional string (constraint warnings to echo)

## Simulated Sheet Snapshot

- **sheetId**: string (matches `SheetMapping`)
- **metadata**: object (tab name, last updated timestamp for display)
- **rows**: array of `Row`

## Row

- **rowIndex**: number
- **cells**: record of column key to `string | number` value

## Input Mapping Instance

- **inputKey**: string
- **currentValue**: string | number
- **isValid**: boolean
- **validationMessage**: string (empty when valid)
- **source**: enum (`configDefault`, `sheet`, `user`)

## Output Scenario

- **scenarioId**: string (hash of input values)
- **timestamp**: ISO string (when calculated)
- **results**: array of `ResultValue`
- **explorationSeries**: optional array of `ExplorationPoint`

## ResultValue

- **outputKey**: string
- **displayValue**: string | number
- **explanation**: string (textual summary shown in UI)

## ExplorationSpec

- **inputKey**: string
- **sampleCount**: number (minimum 5)
- **strategy**: enum (`linear`, `logarithmic`)

## ExplorationPoint

- **inputValue**: number
- **outputValues**: record of output key to number
- **label**: string (for plotting tooltip)
