import type {
  DraftConfiguration,
  ExportConfiguration,
  InputMapping,
  OutputMapping,
  ValidationError,
} from "@/lib/types";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

const excelCellPattern = /^[A-Z]+[0-9]+$/;

const rangeCapableDataTypes: Array<InputMapping["dataType"]> = [
  "number",
  "percentage",
  "currency",
  "date",
];

const sanitizeCommonFields = (mapping: InputMapping | OutputMapping) => {
  const sheetName = mapping.sheetName.trim();
  const cellId = mapping.cellId.trim().toUpperCase();
  const label = mapping.label.trim();

  return {
    ...mapping,
    sheetName,
    cellId,
    label,
  };
};

const stripId = <T extends { id: string }>(mapping: T) => {
  const { id: _discard, ...rest } = mapping;
  void _discard;
  return rest;
};

const ensureConstraintIntegrity = (
  mapping: InputMapping,
  errors: ValidationError[]
) => {
  if (!mapping.constraints) {
    return;
  }

  if (mapping.constraints.type === "discrete") {
    const values = mapping.constraints.values
      .map((value) => value.trim())
      .filter(Boolean);

    if (values.length === 0) {
      errors.push({
        field: `${mapping.label} constraint`,
        message: "Discrete constraint must have at least one value",
      });
    }
  }

  if (mapping.constraints.type === "range") {
    if (!rangeCapableDataTypes.includes(mapping.dataType)) {
      errors.push({
        field: `${mapping.label} constraint`,
        message:
          "Range constraints are only allowed for numeric or date inputs",
      });
      return;
    }

    const { min, max } = mapping.constraints;

    if (typeof min !== "number" || typeof max !== "number") {
      errors.push({
        field: `${mapping.label} constraint`,
        message: "Range constraint requires both minimum and maximum values",
      });
      return;
    }

    if (min > max) {
      errors.push({
        field: `${mapping.label} constraint`,
        message: `Constraint range min (${min}) must be ≤ max (${max})`,
      });
    }
  }
};

const validateCommonFields = (
  mapping: InputMapping | OutputMapping,
  errors: ValidationError[],
  seenLocations: Set<string>
) => {
  const sanitized = sanitizeCommonFields(mapping);
  const descriptor =
    sanitized.label || `${sanitized.sheetName} ${sanitized.cellId}`;

  if (!sanitized.sheetName) {
    errors.push({
      field: descriptor,
      message: "Sheet name is required",
    });
  }

  if (!sanitized.cellId) {
    errors.push({
      field: descriptor,
      message: "Cell is required",
    });
  } else if (!excelCellPattern.test(sanitized.cellId)) {
    errors.push({
      field: descriptor,
      message: `Cell '${sanitized.cellId}' is not a valid Excel cell reference (e.g., 'A1')`,
    });
  }

  if (!sanitized.label) {
    errors.push({
      field: mapping.id,
      message: "Label is required",
    });
  }

  if (sanitized.sheetName && sanitized.cellId) {
    const locationKey = `${sanitized.sheetName.toLowerCase()}::${
      sanitized.cellId
    }`;
    if (seenLocations.has(locationKey)) {
      errors.push({
        field: descriptor,
        message: `Cell location '${sanitized.sheetName}' - '${sanitized.cellId}' already exists`,
      });
    } else {
      seenLocations.add(locationKey);
    }
  }
};

const validateInputs = (
  inputs: InputMapping[],
  errors: ValidationError[],
  seenLocations: Set<string>
) => {
  for (const input of inputs) {
    validateCommonFields(input, errors, seenLocations);

    if (!input.dataType) {
      errors.push({
        field: input.label || input.id,
        message: `Input '${
          input.label || input.cellId
        }' is missing a data type`,
      });
    }

    ensureConstraintIntegrity(input, errors);
  }
};

const validateOutputs = (
  outputs: OutputMapping[],
  errors: ValidationError[],
  seenLocations: Set<string>
) => {
  for (const output of outputs) {
    validateCommonFields(output, errors, seenLocations);
  }
};

export const validateConfiguration = (
  configuration: DraftConfiguration
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (configuration.inputs.length === 0) {
    errors.push({
      message: "Configuration must have at least one input mapping",
    });
  }

  if (configuration.outputs.length === 0) {
    errors.push({
      message: "Configuration must have at least one output mapping",
    });
  }

  const seenLocations = new Set<string>();

  validateInputs(configuration.inputs, errors, seenLocations);
  validateOutputs(configuration.outputs, errors, seenLocations);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const toExportConfiguration = (
  configuration: DraftConfiguration
): ExportConfiguration => ({
  version: "1.0",
  inputs: configuration.inputs.map((input) => stripId(input)),
  outputs: configuration.outputs.map((output) => stripId(output)),
  metadata: {
    ...configuration.metadata,
    createdAt: new Date().toISOString(),
  },
});
