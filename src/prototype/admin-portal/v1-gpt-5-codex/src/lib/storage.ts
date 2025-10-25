import type {
  DraftConfiguration,
  InputMapping,
  OutputMapping,
} from "@/lib/types";
import { createId } from "@/lib/utils";

const STORAGE_KEY = "adminPortalDraft";

type StoredConfiguration = Omit<DraftConfiguration, "inputs" | "outputs"> & {
  inputs: Array<Omit<InputMapping, "id"> & { id?: string }>;
  outputs: Array<Omit<OutputMapping, "id"> & { id?: string }>;
};

const withIds = (configuration: StoredConfiguration): DraftConfiguration => ({
  ...configuration,
  inputs: configuration.inputs.map((mapping) => ({
    ...mapping,
    id: mapping.id ?? createId("input"),
  })),
  outputs: configuration.outputs.map((mapping) => ({
    ...mapping,
    id: mapping.id ?? createId("output"),
  })),
});

export const loadConfiguration = (): DraftConfiguration | null => {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredConfiguration;
    return withIds(parsed);
  } catch (error) {
    console.error("Failed to load configuration from localStorage", error);
    return null;
  }
};

export const saveConfiguration = (configuration: DraftConfiguration) => {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configuration));
  } catch (error) {
    console.error("Failed to persist configuration to localStorage", error);
  }
};

export const clearConfiguration = () => {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
