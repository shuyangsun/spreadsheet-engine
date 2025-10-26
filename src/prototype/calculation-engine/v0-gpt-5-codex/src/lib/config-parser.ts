import { z } from "zod";
import {
  DEFAULT_INPUT_MAPPINGS,
  SAMPLE_CONFIGURATION,
  SAMPLE_SHEET_SNAPSHOT,
  matchSheetByLink,
} from "./sample-data";
import type {
  Constraints,
  ConfigLoadResponse,
  InputDefinition,
  InputMappingInstance,
  OutputDefinition,
  PrototypeConfiguration,
  SheetMapping,
  SheetSnapshot,
  ValidationError,
} from "./types";

const constraintsSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    allowedValues: z.array(z.union([z.string(), z.number()])).optional(),
    step: z.number().optional(),
    notes: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.allowedValues &&
      (value.min !== undefined || value.max !== undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowedValues"],
        message:
          "allowedValues cannot be combined with min/max in the prototype",
      });
    }
  });

const inputDefinitionSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["number", "text", "enum"]),
  defaultValue: z.union([z.string(), z.number()]),
  constraints: constraintsSchema.optional(),
  sheetMapping: z
    .object({
      sheetId: z.string(),
      column: z.string(),
      row: z.number().optional(),
    })
    .optional(),
});

const outputDefinitionSchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string(),
  calculation: z.string(),
  units: z.string().optional(),
  notes: z.string().optional(),
});

const explorationSchema = z
  .object({
    inputKey: z.string(),
    sampleCount: z.number().min(5),
    strategy: z.enum(["linear", "logarithmic"]).optional(),
  })
  .optional();

const configurationSchema = z.object({
  configId: z.string(),
  title: z.string(),
  inputs: z.array(inputDefinitionSchema).min(1),
  outputs: z.array(outputDefinitionSchema).min(1),
  exploration: explorationSchema,
});

export async function parseConfigurationFile(
  file: File
): Promise<PrototypeConfiguration> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  try {
    return validateConfiguration(parsed);
  } catch (error) {
    const adapted = adaptLegacyConfiguration(parsed);

    if (adapted) {
      return validateConfiguration(adapted);
    }

    throw error;
  }
}

export function validateConfiguration(data: unknown): PrototypeConfiguration {
  const result = configurationSchema.safeParse(data);

  if (!result.success) {
    throw mapZodError(result.error);
  }

  return result.data;
}

export function normalizeInputs(
  config: PrototypeConfiguration,
  sheet?: SheetSnapshot
): InputMappingInstance[] {
  if (!sheet) {
    return DEFAULT_INPUT_MAPPINGS;
  }

  return config.inputs.map((input) => {
    const candidate = extractFromSheet(input, sheet);
    return {
      inputKey: input.key,
      currentValue: candidate ?? input.defaultValue,
      isValid: true,
      validationMessage: "",
      source: candidate === undefined ? "configDefault" : "sheet",
    } satisfies InputMappingInstance;
  });
}

export function loadSampleConfiguration(link?: string): ConfigLoadResponse {
  const configuration = SAMPLE_CONFIGURATION;
  const sheet = link ? matchSheetByLink(link) : SAMPLE_SHEET_SNAPSHOT;

  return {
    configuration,
    sheetSnapshot: sheet,
    inputs: normalizeInputs(configuration, sheet),
  } satisfies ConfigLoadResponse;
}

export function toLatchedConfig(
  config: PrototypeConfiguration,
  link: string | undefined
): ConfigLoadResponse {
  const sheet = link ? matchSheetByLink(link) : SAMPLE_SHEET_SNAPSHOT;
  const inputs = normalizeInputs(config, sheet);

  return {
    configuration: config,
    sheetSnapshot: sheet,
    inputs,
  } satisfies ConfigLoadResponse;
}

function extractFromSheet(
  input: InputDefinition,
  sheet: SheetSnapshot
): string | number | undefined {
  if (!input.sheetMapping) {
    return undefined;
  }

  const mapping = input.sheetMapping;
  const row = sheet.rows.find(
    (candidate) => candidate.rowIndex === mapping.row
  );

  if (!row) {
    return undefined;
  }

  return row.cells[mapping.column];
}

function mapZodError(error: z.ZodError): ValidationError {
  return {
    message: "Configuration file is invalid",
    issues: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  } satisfies ValidationError;
}

function adaptLegacyConfiguration(raw: unknown): PrototypeConfiguration | null {
  if (!isPlainObject(raw)) {
    return null;
  }

  const legacy = raw as Record<string, unknown>;

  const inputs = Array.isArray(legacy.inputs) ? legacy.inputs : [];
  const outputs = Array.isArray(legacy.outputs) ? legacy.outputs : [];

  if (inputs.length === 0 || outputs.length === 0) {
    return null;
  }

  const normalizedInputs = inputs
    .map((entry, index) => adaptLegacyInput(entry, index))
    .filter((input): input is InputDefinition => input !== null);

  const normalizedOutputs = outputs
    .map((entry, index) => adaptLegacyOutput(entry, index))
    .filter((output): output is OutputDefinition => output !== null);

  if (normalizedInputs.length === 0 || normalizedOutputs.length === 0) {
    return null;
  }

  const candidate: PrototypeConfiguration = {
    configId: buildLegacyConfigId(legacy),
    title: buildLegacyTitle(legacy),
    inputs: normalizedInputs,
    outputs: normalizedOutputs,
  } satisfies PrototypeConfiguration;

  return candidate;
}

function adaptLegacyInput(
  entry: unknown,
  index: number
): InputDefinition | null {
  if (!isPlainObject(entry)) {
    return null;
  }

  const legacy = entry as Record<string, unknown>;
  const kind =
    typeof legacy.type === "string" ? legacy.type.toLowerCase() : undefined;

  if (kind !== "input") {
    return null;
  }

  const label =
    typeof legacy.label === "string" && legacy.label.trim()
      ? legacy.label
      : `Input ${index + 1}`;
  const cellId =
    typeof legacy.cellId === "string" ? legacy.cellId : `A${index + 1}`;
  const sheetName =
    typeof legacy.sheetName === "string" ? legacy.sheetName : "Legacy Sheet";
  const dataType =
    typeof legacy.dataType === "string" ? legacy.dataType : "text";

  const key = makeKey(legacy.key, label, cellId, index);
  const type = mapLegacyInputType(dataType);
  const defaultValue = deriveDefaultValue(type);
  const constraints = adaptLegacyConstraints(legacy.constraints);
  const sheetMapping = adaptLegacySheetMapping(sheetName, cellId);

  return {
    key,
    label,
    type,
    defaultValue,
    constraints,
    sheetMapping,
  } satisfies InputDefinition;
}

function adaptLegacyOutput(
  entry: unknown,
  index: number
): OutputDefinition | null {
  if (!isPlainObject(entry)) {
    return null;
  }

  const legacy = entry as Record<string, unknown>;
  const kind =
    typeof legacy.type === "string" ? legacy.type.toLowerCase() : undefined;

  if (kind !== "output") {
    return null;
  }

  const label =
    typeof legacy.label === "string" && legacy.label.trim()
      ? legacy.label
      : `Output ${index + 1}`;
  const cellId =
    typeof legacy.cellId === "string" ? legacy.cellId : `Z${index + 1}`;
  const sheetName =
    typeof legacy.sheetName === "string" ? legacy.sheetName : "Outputs";

  return {
    key: makeKey(legacy.key, label, cellId, index),
    label,
    description: `Value sourced from ${sheetName} ${cellId} in the legacy configuration.`,
    calculation: `legacy:${sheetName}:${cellId}`,
  } satisfies OutputDefinition;
}

function mapLegacyInputType(dataType: string): InputDefinition["type"] {
  const normalized = dataType.toLowerCase();

  if (
    [
      "number",
      "integer",
      "float",
      "percent",
      "percentage",
      "currency",
    ].includes(normalized)
  ) {
    return "number";
  }

  if (["enum", "select", "dropdown"].includes(normalized)) {
    return "enum";
  }

  return "text";
}

function deriveDefaultValue(type: InputDefinition["type"]): string | number {
  return type === "number" ? 0 : "";
}

function adaptLegacyConstraints(
  rawConstraints: unknown
): Constraints | undefined {
  if (!isPlainObject(rawConstraints)) {
    return undefined;
  }

  const legacy = rawConstraints as Record<string, unknown>;
  const type =
    typeof legacy.type === "string" ? legacy.type.toLowerCase() : undefined;

  if (type === "range") {
    const min = toNumber(legacy.min);
    const max = toNumber(legacy.max);

    if (min === undefined && max === undefined) {
      return undefined;
    }

    return {
      min,
      max,
    } satisfies Constraints;
  }

  if (type === "enum" || type === "enumeration") {
    const options = Array.isArray(legacy.values)
      ? legacy.values
      : Array.isArray(legacy.options)
      ? legacy.options
      : [];

    const normalized = options.filter(
      (item) => typeof item === "string" || typeof item === "number"
    ) as Array<string | number>;

    if (normalized.length > 0) {
      return {
        allowedValues: normalized,
      } satisfies Constraints;
    }
  }

  return undefined;
}

function adaptLegacySheetMapping(
  sheetName: string,
  cellId: string
): SheetMapping | undefined {
  const parsed = parseCellId(cellId);
  const sheetId = `legacy-${slugify(sheetName) || "sheet"}`;

  if (!parsed) {
    return undefined;
  }

  return {
    sheetId,
    column: parsed.column,
    row: parsed.row,
  } satisfies SheetMapping;
}

function parseCellId(cellId: string): { column: string; row?: number } | null {
  const match = /^([A-Za-z]+)(\d+)?$/.exec(cellId.trim());

  if (!match) {
    return null;
  }

  const column = match[1].toUpperCase();
  const rowCandidate = match[2] ? Number.parseInt(match[2], 10) : undefined;

  return {
    column,
    row:
      typeof rowCandidate === "number" && Number.isFinite(rowCandidate)
        ? rowCandidate
        : undefined,
  };
}

function buildLegacyConfigId(legacy: Record<string, unknown>): string {
  const candidate =
    typeof legacy.configId === "string" ? legacy.configId : undefined;
  const version =
    typeof legacy.version === "string" ? legacy.version : undefined;
  const metadata = isPlainObject(legacy.metadata) ? legacy.metadata : undefined;
  const metadataVersion =
    metadata && typeof metadata.version === "string"
      ? metadata.version
      : undefined;

  const source = candidate || metadataVersion || version || "legacy-config";
  const slug = slugify(source);

  return slug ? `legacy-${slug}` : "legacy-config";
}

function buildLegacyTitle(legacy: Record<string, unknown>): string {
  if (typeof legacy.title === "string" && legacy.title.trim()) {
    return legacy.title.trim();
  }

  const metadata = isPlainObject(legacy.metadata) ? legacy.metadata : undefined;

  if (metadata && typeof metadata.title === "string" && metadata.title.trim()) {
    return metadata.title.trim();
  }

  if (typeof legacy.version === "string" && legacy.version.trim()) {
    return `Imported configuration ${legacy.version.trim()}`;
  }

  return "Imported configuration";
}

function makeKey(
  explicitKey: unknown,
  label: string,
  cellId: string,
  index: number
): string {
  if (typeof explicitKey === "string" && explicitKey.trim()) {
    return slugify(explicitKey.trim());
  }

  const labelSlug = slugify(label);

  if (labelSlug) {
    return labelSlug;
  }

  const cellSlug = slugify(cellId);

  if (cellSlug) {
    return cellSlug;
  }

  return `legacy-input-${index + 1}`;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
