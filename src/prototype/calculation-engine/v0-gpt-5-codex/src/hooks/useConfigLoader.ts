import { useCallback, useMemo, useState } from "react";

import {
  loadSampleConfiguration,
  parseConfigurationFile,
  toLatchedConfig,
} from "@/lib/config-parser";
import { SAMPLE_SHEET_LINK } from "@/lib/sample-data";
import { simulateConfigLoad } from "@/lib/simulation";
import type {
  ConfigLoadResponse,
  PrototypeConfiguration,
  ValidationError,
} from "@/lib/types";

export type LoaderStatus = "idle" | "loading" | "success" | "error";

export type LoaderError = {
  title: string;
  details?: string[];
};

export type LoaderMeta = {
  source: "upload" | "sample";
  fileName?: string;
  sheetLink?: string;
  startedAt?: number;
  completedAt?: number;
};

export type LoaderState = {
  status: LoaderStatus;
  data?: ConfigLoadResponse;
  error?: LoaderError;
  meta?: LoaderMeta;
};

const INITIAL_STATE: LoaderState = {
  status: "idle",
};

export type UploadPayload = {
  file: File;
  sheetLink?: string;
};

export type SamplePayload = {
  sheetLink?: string;
};

export function useConfigLoader() {
  const [state, setState] = useState<LoaderState>(INITIAL_STATE);

  const setLoading = useCallback((meta: LoaderMeta) => {
    setState({
      status: "loading",
      data: undefined,
      error: undefined,
      meta: {
        ...meta,
        startedAt: performance.now(),
        completedAt: undefined,
      },
    });
  }, []);

  const setSuccess = useCallback((data: ConfigLoadResponse) => {
    setState((previous) => ({
      status: "success",
      data,
      error: undefined,
      meta: previous.meta
        ? {
            ...previous.meta,
            completedAt: performance.now(),
          }
        : undefined,
    }));
  }, []);

  const setFailure = useCallback((error: LoaderError) => {
    setState((previous) => ({
      status: "error",
      data: undefined,
      error,
      meta: previous.meta
        ? {
            ...previous.meta,
            completedAt: performance.now(),
          }
        : undefined,
    }));
  }, []);

  const handleUpload = useCallback(
    async ({ file, sheetLink }: UploadPayload) => {
      setLoading({
        source: "upload",
        fileName: file.name,
        sheetLink: sheetLink?.trim() || undefined,
      });

      try {
        const configuration = await parseConfigurationFile(file);
        await processConfiguration(configuration, sheetLink, setSuccess);
      } catch (cause) {
        setFailure(normalizeLoaderError(cause));
      }
    },
    [setFailure, setLoading, setSuccess]
  );

  const handleSample = useCallback(
    async ({ sheetLink }: SamplePayload = {}) => {
      const normalizedLink = sheetLink?.trim() || SAMPLE_SHEET_LINK;

      setLoading({
        source: "sample",
        fileName: "Sample configuration",
        sheetLink: normalizedLink,
      });

      try {
        const sample = loadSampleConfiguration(normalizedLink);
        await simulateConfigLoad(sample.configuration, sample.sheetSnapshot!);
        setSuccess(sample);
      } catch (cause) {
        setFailure(normalizeLoaderError(cause));
      }
    },
    [setFailure, setLoading, setSuccess]
  );

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const statusLabel = useMemo(() => {
    switch (state.status) {
      case "loading":
        return "Loading configuration";
      case "success":
        return "Configuration ready";
      case "error":
        return "Needs attention";
      default:
        return "Awaiting configuration";
    }
  }, [state.status]);

  return {
    ...state,
    statusLabel,
    loadFromUpload: handleUpload,
    loadSample: handleSample,
    reset,
  };
}

async function processConfiguration(
  configuration: PrototypeConfiguration,
  sheetLink: string | undefined,
  onComplete: (data: ConfigLoadResponse) => void
) {
  const normalizedLink = sheetLink?.trim();
  const latched = toLatchedConfig(configuration, normalizedLink);

  if (!latched.sheetSnapshot) {
    throw new Error("No sheet snapshot found in prototype bundle.");
  }

  await simulateConfigLoad(latched.configuration, latched.sheetSnapshot);

  onComplete(latched);
}

function normalizeLoaderError(source: unknown): LoaderError {
  if (isValidationError(source)) {
    return {
      title: source.message,
      details:
        source.issues.length > 0
          ? source.issues.map((issue) =>
              issue.field ? `${issue.field}: ${issue.message}` : issue.message
            )
          : undefined,
    } satisfies LoaderError;
  }

  if (source instanceof Error) {
    return {
      title: source.message,
      details: source.stack ? [source.stack] : undefined,
    } satisfies LoaderError;
  }

  return {
    title: "Unexpected error while loading configuration",
  } satisfies LoaderError;
}

function isValidationError(value: unknown): value is ValidationError {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as ValidationError & Partial<Record<string, unknown>>;

  return (
    typeof candidate.message === "string" && Array.isArray(candidate.issues)
  );
}
