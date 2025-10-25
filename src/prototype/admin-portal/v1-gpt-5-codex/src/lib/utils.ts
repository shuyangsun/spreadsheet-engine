import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type {
  DraftConfiguration,
  ExportConfiguration,
  ExportInputMapping,
  ExportOutputMapping,
  InputMapping,
  OutputMapping,
  VersionTag,
} from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createId(prefix = "id") {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const sanitizeSheetName = (value: string) => value.trim();
const sanitizeCellId = (value: string) => value.trim().toUpperCase();
const sanitizeLabel = (value: string) => value.trim();

const toExportInput = (mapping: InputMapping): ExportInputMapping => {
  const exportMapping: ExportInputMapping = {
    type: "input",
    sheetName: sanitizeSheetName(mapping.sheetName),
    cellId: sanitizeCellId(mapping.cellId),
    label: sanitizeLabel(mapping.label),
    dataType: mapping.dataType,
  };

  if (mapping.constraints) {
    exportMapping.constraints = mapping.constraints;
  }

  return exportMapping;
};

const toExportOutput = (mapping: OutputMapping): ExportOutputMapping => ({
  type: "output",
  sheetName: sanitizeSheetName(mapping.sheetName),
  cellId: sanitizeCellId(mapping.cellId),
  label: sanitizeLabel(mapping.label),
});

const mappingSortKey = (mapping: {
  sheetName: string;
  cellId: string;
  label: string;
  type: string;
}) =>
  `${mapping.sheetName.toLowerCase()}::${mapping.cellId.toLowerCase()}::${mapping.label.toLowerCase()}::${
    mapping.type
  }`;

const sortInputs = (inputs: ExportInputMapping[]) =>
  [...inputs].sort((a, b) =>
    mappingSortKey(a).localeCompare(mappingSortKey(b))
  );

const sortOutputs = (outputs: ExportOutputMapping[]) =>
  [...outputs].sort((a, b) =>
    mappingSortKey(a).localeCompare(mappingSortKey(b))
  );

const stableStringify = (value: unknown): string => {
  const seen = new WeakSet<object>();

  const normalize = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input.map(normalize);
    }

    if (input && typeof input === "object") {
      const obj = input as Record<string, unknown>;

      if (seen.has(obj)) {
        throw new TypeError("Cannot stringify circular structure");
      }

      seen.add(obj);

      const sortedKeys = Object.keys(obj).sort();
      const normalized: Record<string, unknown> = {};

      for (const key of sortedKeys) {
        normalized[key] = normalize(obj[key]);
      }

      return normalized;
    }

    return input;
  };

  return JSON.stringify(normalize(value));
};

export const normalizeExportConfiguration = (
  configuration: DraftConfiguration
): ExportConfiguration => {
  const inputs = sortInputs(configuration.inputs.map(toExportInput));
  const outputs = sortOutputs(configuration.outputs.map(toExportOutput));

  const metadata = {
    createdAt: configuration.metadata.createdAt,
    updatedAt: configuration.metadata.updatedAt ?? null,
    version: configuration.metadata.version,
    ...(configuration.metadata.schemaVersion !== undefined
      ? { schemaVersion: configuration.metadata.schemaVersion }
      : {}),
    ...(configuration.metadata.source !== undefined
      ? { source: configuration.metadata.source }
      : {}),
  };

  return {
    version: metadata.version,
    inputs,
    outputs,
    metadata,
    ...(configuration.metadata.schemaVersion !== undefined
      ? { schemaVersion: configuration.metadata.schemaVersion }
      : {}),
  };
};

const normalizeExportSnapshot = (
  configuration: ExportConfiguration
): ExportConfiguration => ({
  version: configuration.version,
  inputs: sortInputs(
    configuration.inputs.map((mapping) => ({
      ...mapping,
      constraints:
        mapping.constraints === undefined ? undefined : mapping.constraints,
    }))
  ),
  outputs: sortOutputs(configuration.outputs),
  metadata: {
    createdAt: configuration.metadata.createdAt,
    updatedAt: configuration.metadata.updatedAt ?? null,
    version: configuration.metadata.version,
    ...(configuration.metadata.schemaVersion !== undefined
      ? { schemaVersion: configuration.metadata.schemaVersion }
      : {}),
    ...(configuration.metadata.source !== undefined
      ? { source: configuration.metadata.source }
      : {}),
  },
  ...(configuration.schemaVersion !== undefined
    ? { schemaVersion: configuration.schemaVersion }
    : {}),
});

export const areExportsEqual = (
  first: ExportConfiguration,
  second: ExportConfiguration
): boolean =>
  stableStringify(normalizeExportSnapshot(first)) ===
  stableStringify(normalizeExportSnapshot(second));

export const parseVersionTag = (version: string): number | null => {
  const match = /^v(\d+)$/i.exec(version.trim());
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1] ?? "", 10);
};

export const incrementVersionTag = (version: VersionTag): VersionTag => {
  const numeric = parseVersionTag(version);

  if (numeric === null) {
    return "v1";
  }

  return `v${numeric + 1}` as VersionTag;
};
