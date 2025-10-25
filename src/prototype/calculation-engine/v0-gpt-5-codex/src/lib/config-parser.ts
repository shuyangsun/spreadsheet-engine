// @ts-nocheck
import { z } from "zod";
import {
  DEFAULT_INPUT_MAPPINGS,
  SAMPLE_CONFIGURATION,
  SAMPLE_SHEET_SNAPSHOT,
  matchSheetByLink,
} from "./sample-data";
import type {
  ConfigLoadResponse,
  InputDefinition,
  InputMappingInstance,
  PrototypeConfiguration,
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
  return validateConfiguration(parsed);
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
