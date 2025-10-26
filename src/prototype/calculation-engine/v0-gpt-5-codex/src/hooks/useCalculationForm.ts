import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";

import {
  getSheetSuggestion,
  normalizeInputValue,
  toFormValue,
  validateInputValue,
} from "@/lib/constraints";
import {
  runPrototypeCalculation,
  type CalculationInputRecord,
} from "@/lib/calculator";
import type {
  InputDefinition,
  InputMappingInstance,
  OutputScenario,
  PrototypeConfiguration,
  SheetSnapshot,
} from "@/lib/types";

export type CalculationFormValues = Record<string, string>;

export type CalculationStatus = "idle" | "processing" | "success" | "error";

export type UseCalculationFormArgs = {
  configuration?: PrototypeConfiguration;
  initialInputs?: InputMappingInstance[];
  sheetSnapshot?: SheetSnapshot;
};

export type UseCalculationFormResult = {
  form: UseFormReturn<CalculationFormValues>;
  submit: () => void;
  reset: () => void;
  status: CalculationStatus;
  error?: string;
  scenario?: OutputScenario;
  isReady: boolean;
  mappings?: InputMappingInstance[];
  sheetSuggestions: Map<string, string | number>;
  applyConfigDefault: (inputKey: string) => void;
  applySheetSuggestion: (inputKey: string) => void;
  lastSubmittedAt?: number;
};

export function useCalculationForm({
  configuration,
  initialInputs,
  sheetSnapshot,
}: UseCalculationFormArgs): UseCalculationFormResult {
  const form = useForm<CalculationFormValues>({
    defaultValues: buildInitialValues(configuration, initialInputs),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const baselineMap = useMemo(
    () => createMappingLookup(initialInputs),
    [initialInputs]
  );

  const [mappings, setMappings] = useState<InputMappingInstance[] | undefined>(
    cloneMappings(initialInputs)
  );
  const [status, setStatus] = useState<CalculationStatus>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const [scenario, setScenario] = useState<OutputScenario | undefined>(
    undefined
  );
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number | undefined>();

  useEffect(() => {
    form.reset(buildInitialValues(configuration, initialInputs));
    setMappings(cloneMappings(initialInputs));
    setScenario(undefined);
    setStatus("idle");
    setError(undefined);
    setLastSubmittedAt(undefined);
  }, [configuration, initialInputs, form]);

  const sheetSuggestions = useMemo(() => {
    if (!configuration) {
      return new Map<string, string | number>();
    }

    const entries = configuration.inputs
      .map((definition) => {
        const suggestion =
          getSheetSuggestion(definition, sheetSnapshot) ??
          baselineMap.get(definition.key)?.currentValue;

        return suggestion !== undefined
          ? ([definition.key, suggestion] as const)
          : undefined;
      })
      .filter(Boolean) as Array<readonly [string, string | number]>;

    return new Map(entries);
  }, [baselineMap, configuration, sheetSnapshot]);

  const applyConfigDefault = useCallback(
    (inputKey: string) => {
      if (!configuration) {
        return;
      }

      const definition = configuration.inputs.find(
        (candidate) => candidate.key === inputKey
      );

      if (!definition) {
        return;
      }

      const value = definition.defaultValue;

      form.setValue(inputKey, toFormValue(value), {
        shouldDirty: true,
        shouldTouch: true,
      });
      form.clearErrors(inputKey);

      setMappings((previous) =>
        upsertMapping(previous, definition, value, "configDefault")
      );
    },
    [configuration, form]
  );

  const applySheetSuggestion = useCallback(
    (inputKey: string) => {
      if (!configuration) {
        return;
      }

      const definition = configuration.inputs.find(
        (candidate) => candidate.key === inputKey
      );

      if (!definition) {
        return;
      }

      const suggestion = sheetSuggestions.get(inputKey);

      if (suggestion === undefined) {
        return;
      }

      form.setValue(inputKey, toFormValue(suggestion), {
        shouldDirty: true,
        shouldTouch: true,
      });
      form.clearErrors(inputKey);

      setMappings((previous) =>
        upsertMapping(previous, definition, suggestion, "sheet")
      );
    },
    [configuration, form, sheetSuggestions]
  );

  const onValidSubmit = useCallback(
    async (values: CalculationFormValues) => {
      if (!configuration) {
        setError("Load a configuration before running calculations.");
        setStatus("error");
        return;
      }

      setStatus("processing");
      setError(undefined);

      const parsedValues: CalculationInputRecord = {};
      let hasError = false;

      configuration.inputs.forEach((definition) => {
        const rawValue = values[definition.key] ?? "";
        const normalized = normalizeInputValue(definition, rawValue);

        if (!normalized.value && normalized.value !== 0) {
          hasError = true;
          form.setError(definition.key, {
            type: "manual",
            message: normalized.error ?? "Enter a value.",
          });
          return;
        }

        const validation = validateInputValue(definition, normalized.value);

        if (!validation.isValid) {
          hasError = true;
          form.setError(definition.key, {
            type: "manual",
            message: validation.message,
          });
          return;
        }

        form.clearErrors(definition.key);
        parsedValues[definition.key] = normalized.value;
      });

      if (hasError) {
        setStatus("error");
        return;
      }

      try {
        const scenarioResult = await runPrototypeCalculation(
          configuration,
          parsedValues
        );

        setScenario(scenarioResult);
        setStatus("success");
        setLastSubmittedAt(Date.now());

        setMappings((previous) =>
          configuration.inputs.map((definition) => {
            const existing = previous?.find(
              (entry) => entry.inputKey === definition.key
            );
            const source =
              existing && existing.source !== "user" ? existing.source : "user";

            return {
              inputKey: definition.key,
              currentValue: parsedValues[definition.key],
              isValid: true,
              validationMessage: "",
              source,
            } satisfies InputMappingInstance;
          })
        );
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unexpected calculation error."
        );
        setStatus("error");
      }
    },
    [configuration, form]
  );

  const onInvalidSubmit = useCallback(() => {
    setStatus("error");
  }, []);

  const submit = useCallback(() => {
    void form.handleSubmit(onValidSubmit, onInvalidSubmit)();
  }, [form, onInvalidSubmit, onValidSubmit]);

  const reset = useCallback(() => {
    form.reset(buildInitialValues(configuration, initialInputs));
    setMappings(cloneMappings(initialInputs));
    setScenario(undefined);
    setStatus("idle");
    setError(undefined);
    setLastSubmittedAt(undefined);
  }, [configuration, form, initialInputs]);

  return {
    form,
    submit,
    reset,
    status,
    error,
    scenario,
    isReady: Boolean(configuration),
    mappings,
    sheetSuggestions,
    applyConfigDefault,
    applySheetSuggestion,
    lastSubmittedAt,
  } satisfies UseCalculationFormResult;
}

function buildInitialValues(
  configuration?: PrototypeConfiguration,
  inputs?: InputMappingInstance[]
): CalculationFormValues {
  const values: CalculationFormValues = {};

  if (!configuration) {
    return values;
  }

  const mappingLookup = createMappingLookup(inputs);

  configuration.inputs.forEach((definition) => {
    const primary = mappingLookup.get(definition.key)?.currentValue;
    const fallback = definition.defaultValue;
    const hydrated = primary ?? fallback;

    values[definition.key] = toFormValue(hydrated);
  });

  return values;
}

function createMappingLookup(
  inputs?: InputMappingInstance[]
): Map<string, InputMappingInstance> {
  if (!inputs) {
    return new Map();
  }

  return new Map(inputs.map((entry) => [entry.inputKey, { ...entry }]));
}

function cloneMappings(
  inputs?: InputMappingInstance[]
): InputMappingInstance[] | undefined {
  if (!inputs) {
    return undefined;
  }

  return inputs.map((entry) => ({ ...entry }));
}

function upsertMapping(
  previous: InputMappingInstance[] | undefined,
  definition: InputDefinition,
  value: string | number,
  source: InputMappingInstance["source"]
): InputMappingInstance[] {
  const next = previous ? [...previous] : [];
  const index = next.findIndex((entry) => entry.inputKey === definition.key);
  const updated: InputMappingInstance = {
    inputKey: definition.key,
    currentValue: value,
    isValid: true,
    validationMessage: "",
    source,
  } satisfies InputMappingInstance;

  if (index >= 0) {
    next[index] = updated;
  } else {
    next.push(updated);
  }

  return next;
}
