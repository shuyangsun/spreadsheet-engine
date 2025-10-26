import type { InputDefinition, SheetSnapshot } from "./types";

export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export type NormalizedFieldValue = {
  value?: string | number;
  error?: string;
};

export function normalizeInputValue(
  definition: InputDefinition,
  rawValue: string
): NormalizedFieldValue {
  const trimmed = rawValue.trim();

  switch (definition.type) {
    case "number": {
      if (!trimmed) {
        return { error: "Enter a numeric value." };
      }

      const parsed = Number(trimmed);

      if (!Number.isFinite(parsed)) {
        return { error: "Value must be a valid number." };
      }

      return { value: parsed };
    }
    case "enum": {
      if (!trimmed) {
        return { error: "Select a value." };
      }

      return { value: trimmed };
    }
    default: {
      return { value: trimmed };
    }
  }
}

export function validateInputValue(
  definition: InputDefinition,
  value: string | number
): ValidationResult {
  const { constraints } = definition;

  if (!constraints) {
    return { isValid: true };
  }

  if (constraints.allowedValues && constraints.allowedValues.length > 0) {
    const isAllowed = constraints.allowedValues.some((candidate) =>
      compareConstraintValue(candidate, value)
    );

    if (!isAllowed) {
      return {
        isValid: false,
        message: `Value must be one of: ${constraints.allowedValues
          .map((entry) => formatValue(entry))
          .join(", ")}.`,
      } satisfies ValidationResult;
    }
  }

  if (typeof value === "number") {
    if (typeof constraints.min === "number" && value < constraints.min) {
      return {
        isValid: false,
        message: `Value must be greater than or equal to ${formatValue(
          constraints.min
        )}.`,
      } satisfies ValidationResult;
    }

    if (typeof constraints.max === "number" && value > constraints.max) {
      return {
        isValid: false,
        message: `Value must be less than or equal to ${formatValue(
          constraints.max
        )}.`,
      } satisfies ValidationResult;
    }
  }

  return { isValid: true } satisfies ValidationResult;
}

export function formatConstraintSummary(definition: InputDefinition): string {
  const { constraints } = definition;

  if (!constraints) {
    return "No constraints configured";
  }

  if (constraints.allowedValues && constraints.allowedValues.length > 0) {
    return `Allowed: ${constraints.allowedValues
      .map((item) => formatValue(item))
      .join(", ")}`;
  }

  const parts: string[] = [];

  if (typeof constraints.min === "number") {
    parts.push(`Min ${formatValue(constraints.min)}`);
  }

  if (typeof constraints.max === "number") {
    parts.push(`Max ${formatValue(constraints.max)}`);
  }

  if (typeof constraints.step === "number") {
    parts.push(`Step ${formatValue(constraints.step)}`);
  }

  if (parts.length === 0) {
    return "No constraints configured";
  }

  return parts.join(" · ");
}

export function getSheetSuggestion(
  definition: InputDefinition,
  sheet?: SheetSnapshot
): string | number | undefined {
  if (!sheet || !definition.sheetMapping) {
    return undefined;
  }

  const { sheetMapping } = definition;

  const row = sheet.rows.find(
    (candidate) => candidate.rowIndex === sheetMapping.row
  );

  if (!row) {
    return undefined;
  }

  return row.cells[sheetMapping.column];
}

export function toFormValue(value: string | number | undefined): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "number") {
    return String(value);
  }

  return value;
}

export function formatValue(value: string | number): string {
  if (typeof value === "number") {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 4,
    }).format(value);
  }

  return value;
}

function compareConstraintValue(
  baseline: string | number,
  candidate: string | number
): boolean {
  if (typeof baseline === "number" && typeof candidate === "number") {
    return baseline === candidate;
  }

  return String(baseline).toLowerCase() === String(candidate).toLowerCase();
}
