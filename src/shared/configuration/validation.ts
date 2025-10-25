import type {
  Constraint,
  DataType,
  DraftConfiguration,
  ExportConfiguration,
  ExportInputMapping,
  ExportOutputMapping,
  InputMapping,
  OutputMapping,
  ValidationError,
} from "./types";
import {
  draftFromExportConfiguration,
  normalizeExportConfiguration,
  parseVersionTag,
  toExportConfiguration,
} from "./transforms";

export const SUPPORTED_SCHEMA_VERSIONS = ["1.0"] as const;

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

const allowedDataTypes: DataType[] = [
  "number",
  "text",
  "percentage",
  "currency",
  "date",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const parseSchemaVersionField = (
  value: unknown,
  context: string,
  errors: string[]
): string | null => {
  if (value === undefined) {
    return null;
  }

  if (value === null || typeof value !== "string") {
    errors.push(`${context} must be a non-empty string.`);
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    errors.push(`${context} cannot be empty.`);
    return null;
  }

  return trimmed;
};

type ConstraintParseResult =
  | {
      ok: true;
      constraint: Constraint | null | undefined;
    }
  | {
      ok: false;
    };

const parseConstraintValue = (
  value: unknown,
  context: string,
  errors: string[]
): ConstraintParseResult => {
  if (value === undefined) {
    return {
      ok: true,
      constraint: undefined,
    };
  }

  if (value === null) {
    return {
      ok: true,
      constraint: null,
    };
  }

  if (!isRecord(value)) {
    errors.push(`${context}: constraints must be an object or null.`);
    return { ok: false };
  }

  if (value.type === "discrete") {
    if (!Array.isArray(value.values) || value.values.length === 0) {
      errors.push(
        `${context}: discrete constraints require a non-empty array of values.`
      );
      return { ok: false };
    }

    const values = value.values
      .map((item) =>
        typeof item === "string" ? item.trim() : String(item ?? "").trim()
      )
      .filter((item) => item.length > 0);

    if (values.length === 0) {
      errors.push(
        `${context}: discrete constraints must include at least one non-empty value.`
      );
      return { ok: false };
    }

    return {
      ok: true,
      constraint: {
        type: "discrete",
        values,
      },
    };
  }

  if (value.type === "range") {
    const minValue =
      value.min === null || typeof value.min === "number"
        ? (value.min as number | null)
        : Number(value.min);
    const maxValue =
      value.max === null || typeof value.max === "number"
        ? (value.max as number | null)
        : Number(value.max);

    if (Number.isNaN(minValue ?? 0) || Number.isNaN(maxValue ?? 0)) {
      errors.push(
        `${context}: range constraints require numeric minimum and maximum values.`
      );
      return { ok: false };
    }

    return {
      ok: true,
      constraint: {
        type: "range",
        min: minValue ?? null,
        max: maxValue ?? null,
      },
    };
  }

  errors.push(`${context}: unsupported constraint type.`);
  return { ok: false };
};

const parseExportInputMapping = (
  value: unknown,
  index: number,
  errors: string[]
): ExportInputMapping | null => {
  if (!isRecord(value)) {
    errors.push(`Input #${index + 1}: expected an object.`);
    return null;
  }

  const context = `Input #${index + 1}`;
  const startErrorCount = errors.length;

  if (value.type !== "input") {
    errors.push(`${context}: type must be "input".`);
  }

  const sheetName = asString(value.sheetName);
  if (!sheetName) {
    errors.push(`${context}: sheetName is required.`);
  }

  const cellId = asString(value.cellId);
  if (!cellId) {
    errors.push(`${context}: cellId is required.`);
  }

  const label = asString(value.label);
  if (!label) {
    errors.push(`${context}: label is required.`);
  }

  const rawDataType = asString(value.dataType);
  if (!rawDataType) {
    errors.push(`${context}: dataType is required.`);
  }

  const normalizedDataType = rawDataType?.toLowerCase() as DataType | undefined;
  if (!normalizedDataType || !allowedDataTypes.includes(normalizedDataType)) {
    errors.push(
      `${context}: dataType must be one of ${allowedDataTypes.join(", ")}.`
    );
  }

  const constraintResult = parseConstraintValue(
    value.constraints,
    context,
    errors
  );

  if (!constraintResult.ok || errors.length > startErrorCount) {
    return null;
  }

  return {
    type: "input",
    sheetName: sheetName ?? "",
    cellId: cellId ?? "",
    label: label ?? "",
    dataType: normalizedDataType as DataType,
    ...(constraintResult.constraint !== undefined
      ? { constraints: constraintResult.constraint }
      : {}),
  };
};

const parseExportOutputMapping = (
  value: unknown,
  index: number,
  errors: string[]
): ExportOutputMapping | null => {
  if (!isRecord(value)) {
    errors.push(`Output #${index + 1}: expected an object.`);
    return null;
  }

  const context = `Output #${index + 1}`;
  const startErrorCount = errors.length;

  if (value.type !== "output") {
    errors.push(`${context}: type must be "output".`);
  }

  const sheetName = asString(value.sheetName);
  if (!sheetName) {
    errors.push(`${context}: sheetName is required.`);
  }

  const cellId = asString(value.cellId);
  if (!cellId) {
    errors.push(`${context}: cellId is required.`);
  }

  const label = asString(value.label);
  if (!label) {
    errors.push(`${context}: label is required.`);
  }

  if ("dataType" in value) {
    errors.push(
      `${context}: outputs must not include a dataType. Remove the metadata field.`
    );
  }

  if ("constraints" in value) {
    errors.push(
      `${context}: outputs must not include constraints metadata. Remove the constraints field.`
    );
  }

  if (errors.length > startErrorCount) {
    return null;
  }

  return {
    type: "output",
    sheetName: sheetName ?? "",
    cellId: cellId ?? "",
    label: label ?? "",
  };
};

const collectUniqueErrors = (messages: string[]): string[] => [
  ...new Set(messages.map((message) => message.trim()).filter(Boolean)),
];

export type ImportValidationResult =
  | {
      success: true;
      draft: DraftConfiguration;
      snapshot: ExportConfiguration;
      schemaVersion: string | null;
    }
  | {
      success: false;
      errors: string[];
    };

export const validateImportedJson = (raw: string): ImportValidationResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    void error;
    return {
      success: false,
      errors: ["The selected file does not contain valid JSON."],
    };
  }

  if (!isRecord(parsed)) {
    return {
      success: false,
      errors: ["Imported configuration must be a JSON object."],
    };
  }

  const errors: string[] = [];

  const versionValue = asString(parsed.version);
  if (!versionValue) {
    errors.push('Configuration is missing a top-level version (e.g., "v5").');
  } else if (parseVersionTag(versionValue) === null) {
    errors.push(`Version '${versionValue}' must follow the pattern v<number>.`);
  }

  const inputsValue = Array.isArray(parsed.inputs) ? parsed.inputs : null;
  if (!inputsValue) {
    errors.push("Configuration requires an 'inputs' array.");
  }

  const outputsValue = Array.isArray(parsed.outputs) ? parsed.outputs : null;
  if (!outputsValue) {
    errors.push("Configuration requires an 'outputs' array.");
  }

  const metadataValue = isRecord(parsed.metadata) ? parsed.metadata : null;
  if (!metadataValue) {
    errors.push("Configuration requires a 'metadata' object.");
  }

  const rootSchemaVersion = parseSchemaVersionField(
    (parsed as Record<string, unknown>).schemaVersion,
    "schemaVersion",
    errors
  );

  const metadataSchemaVersionRaw = metadataValue
    ? (metadataValue as Record<string, unknown>).schemaVersion
    : undefined;

  const metadataSchemaVersion = parseSchemaVersionField(
    metadataSchemaVersionRaw,
    "metadata.schemaVersion",
    errors
  );

  if (
    rootSchemaVersion &&
    metadataSchemaVersion &&
    rootSchemaVersion !== metadataSchemaVersion
  ) {
    errors.push(
      "schemaVersion must match metadata.schemaVersion when both are provided."
    );
  }

  const resolvedSchemaVersion =
    rootSchemaVersion ?? metadataSchemaVersion ?? null;

  let metadata: DraftConfiguration["metadata"] | null = null;
  if (metadataValue) {
    const createdAt = asString(metadataValue.createdAt);
    if (!createdAt) {
      errors.push("metadata.createdAt must be an ISO timestamp string.");
    }

    const metadataVersion = asString(metadataValue.version);
    if (!metadataVersion) {
      errors.push('metadata.version must be provided (e.g., "v5").');
    } else if (parseVersionTag(metadataVersion) === null) {
      errors.push(
        `metadata.version '${metadataVersion}' must follow the pattern v<number>.`
      );
    }

    const updatedAtRaw = metadataValue.updatedAt;
    const updatedAt =
      updatedAtRaw === null
        ? null
        : typeof updatedAtRaw === "string"
        ? updatedAtRaw
        : null;

    if (updatedAtRaw !== undefined && updatedAtRaw !== null && !updatedAt) {
      errors.push("metadata.updatedAt must be null or a timestamp string.");
    }

    const sourceRaw = metadataValue.source;
    const source =
      sourceRaw === undefined || sourceRaw === null
        ? undefined
        : typeof sourceRaw === "string"
        ? sourceRaw
        : null;

    if (sourceRaw !== undefined && source === null) {
      errors.push("metadata.source must be a string when provided.");
    }

    if (createdAt && metadataVersion) {
      metadata = {
        createdAt,
        updatedAt: updatedAt ?? null,
        version: metadataVersion as DraftConfiguration["metadata"]["version"],
        ...(resolvedSchemaVersion
          ? { schemaVersion: resolvedSchemaVersion }
          : {}),
        ...(source !== undefined ? { source } : {}),
      };
    }
  }

  const parsedInputs: ExportInputMapping[] = inputsValue
    ? inputsValue
        .map((mapping, index) =>
          parseExportInputMapping(mapping, index, errors)
        )
        .filter((mapping): mapping is ExportInputMapping => Boolean(mapping))
    : [];

  const parsedOutputs: ExportOutputMapping[] = outputsValue
    ? outputsValue
        .map((mapping, index) =>
          parseExportOutputMapping(mapping, index, errors)
        )
        .filter((mapping): mapping is ExportOutputMapping => Boolean(mapping))
    : [];

  if (metadata && versionValue && metadata.version !== versionValue) {
    errors.push("Top-level version must match metadata.version.");
  }

  if (!metadata) {
    errors.push("Configuration metadata is incomplete.");
  }

  const uniqueErrors = collectUniqueErrors(errors);
  if (uniqueErrors.length > 0) {
    return {
      success: false,
      errors: uniqueErrors,
    };
  }

  const exportConfiguration: ExportConfiguration = {
    version: metadata!.version,
    inputs: parsedInputs,
    outputs: parsedOutputs,
    metadata: metadata!,
    ...(resolvedSchemaVersion ? { schemaVersion: resolvedSchemaVersion } : {}),
  };

  const draft = draftFromExportConfiguration(exportConfiguration);
  const validation = validateConfiguration(draft);

  if (!validation.isValid) {
    const validationMessages = collectUniqueErrors(
      validation.errors.map((error) =>
        error.field ? `${error.field}: ${error.message}` : error.message
      )
    );

    return {
      success: false,
      errors: validationMessages,
    };
  }

  return {
    success: true,
    draft,
    snapshot: toExportConfiguration(draft),
    schemaVersion: resolvedSchemaVersion,
  };
};

export {
  draftFromExportConfiguration,
  toExportConfiguration,
} from "./transforms";
