import type {
  DraftBundle,
  DraftConfiguration,
  ImportBaseline,
  InputMapping,
  OutputMapping,
} from "@/lib/types";
import { createId } from "@/lib/utils";

const STORAGE_KEY = "adminPortalDraft";

type StoredInputMapping = Omit<InputMapping, "id"> & { id?: string };
type StoredOutputMapping = Omit<OutputMapping, "id"> & { id?: string };

type StoredDraftConfiguration = Omit<
  DraftConfiguration,
  "inputs" | "outputs"
> & {
  inputs: StoredInputMapping[];
  outputs: StoredOutputMapping[];
};

interface StoredDraftBundle {
  configuration: StoredDraftConfiguration;
  importBaseline: ImportBaseline | null;
}

const normalizeImportBaseline = (
  baseline: ImportBaseline | null
): ImportBaseline | null => {
  if (!baseline) {
    return null;
  }

  return {
    snapshot: baseline.snapshot,
    importedAt: baseline.importedAt,
    sourceFileName: baseline.sourceFileName ?? null,
    schemaVersion: baseline.schemaVersion ?? null,
  };
};

const normalizeMetadata = (
  metadata: DraftConfiguration["metadata"]
): DraftConfiguration["metadata"] => ({
  createdAt: metadata.createdAt,
  updatedAt: metadata.updatedAt ?? null,
  version: metadata.version,
  ...(metadata.schemaVersion !== undefined
    ? { schemaVersion: metadata.schemaVersion ?? null }
    : {}),
  ...(metadata.source !== undefined ? { source: metadata.source } : {}),
});

const withIds = (
  configuration: StoredDraftConfiguration
): DraftConfiguration => ({
  ...configuration,
  inputs: configuration.inputs.map((mapping) => ({
    type: "input" as const,
    sheetName: mapping.sheetName,
    cellId: mapping.cellId,
    label: mapping.label,
    dataType: mapping.dataType ?? "text",
    constraints: mapping.constraints ?? null,
    id: mapping.id ?? createId("input"),
  })),
  outputs: configuration.outputs.map((mapping) => ({
    type: "output" as const,
    sheetName: mapping.sheetName,
    cellId: mapping.cellId,
    label: mapping.label,
    id: mapping.id ?? createId("output"),
  })),
  metadata: normalizeMetadata(configuration.metadata),
});

const toStoredConfiguration = (
  configuration: DraftConfiguration
): StoredDraftConfiguration => ({
  ...configuration,
  inputs: configuration.inputs.map(({ id, ...rest }) => ({
    ...rest,
    id,
  })),
  outputs: configuration.outputs.map(({ id, ...rest }) => ({
    ...rest,
    id,
  })),
});

const isStoredBundle = (value: unknown): value is StoredDraftBundle => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "configuration" in value && "importBaseline" in value;
};

const migrateLegacyConfiguration = (
  value: StoredDraftConfiguration
): DraftBundle => ({
  configuration: withIds(value),
  importBaseline: null,
});

const parseStored = (raw: string): DraftBundle | null => {
  try {
    const parsed = JSON.parse(raw) as
      | StoredDraftBundle
      | StoredDraftConfiguration;

    if (isStoredBundle(parsed)) {
      return {
        configuration: withIds(parsed.configuration),
        importBaseline: normalizeImportBaseline(parsed.importBaseline ?? null),
      };
    }

    return migrateLegacyConfiguration(parsed as StoredDraftConfiguration);
  } catch (error) {
    console.error("Failed to parse configuration from localStorage", error);
    return null;
  }
};

export const loadDraftBundle = (): DraftBundle | null => {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  return parseStored(raw);
};

export const saveDraftBundle = (bundle: DraftBundle) => {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return;
  }

  const payload: StoredDraftBundle = {
    configuration: toStoredConfiguration(bundle.configuration),
    importBaseline: normalizeImportBaseline(bundle.importBaseline),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error(
      "Failed to persist configuration bundle to localStorage",
      error
    );
  }
};

export const clearDraftBundle = () => {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};

export const loadConfiguration = (): DraftConfiguration | null =>
  loadDraftBundle()?.configuration ?? null;

export const saveConfiguration = (
  configuration: DraftConfiguration,
  importBaseline: ImportBaseline | null = null
) =>
  saveDraftBundle({
    configuration,
    importBaseline,
  });

export const clearConfiguration = () => clearDraftBundle();
