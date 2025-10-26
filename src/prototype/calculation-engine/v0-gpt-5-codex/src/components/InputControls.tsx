import { Fragment, useMemo } from "react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CalculationFormValues,
  CalculationStatus,
} from "@/hooks/useCalculationForm";
import { formatConstraintSummary, formatValue } from "@/lib/constraints";
import type {
  InputDefinition,
  InputMappingInstance,
  PrototypeConfiguration,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export type InputControlsProps = {
  configuration?: PrototypeConfiguration;
  form: UseFormReturn<CalculationFormValues>;
  onSubmit: () => void;
  onReset: () => void;
  status: CalculationStatus;
  disabled?: boolean;
  mappings?: InputMappingInstance[];
  sheetSuggestions: Map<string, string | number>;
  applyConfigDefault: (inputKey: string) => void;
  applySheetSuggestion: (inputKey: string) => void;
  error?: string;
};

export function InputControls({
  configuration,
  form,
  onSubmit,
  onReset,
  status,
  disabled = false,
  mappings,
  sheetSuggestions,
  applyConfigDefault,
  applySheetSuggestion,
  error,
}: InputControlsProps) {
  const isBusy = status === "processing" || disabled;

  const mappingLookup = useMemo(() => {
    if (!mappings) {
      return new Map<string, InputMappingInstance>();
    }

    return new Map(mappings.map((entry) => [entry.inputKey, entry]));
  }, [mappings]);

  if (!configuration) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
        Load a configuration to edit input values.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <header className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Input controls
          </h3>
          <p className="text-sm text-muted-foreground">
            Adjust values within the configured constraints, then run the
            prototype calculation.
          </p>
        </header>

        <div className="space-y-5">
          {configuration.inputs.map((input) => (
            <FormField
              key={input.key}
              name={input.key as keyof CalculationFormValues}
              control={form.control}
              render={({ field }) => (
                <InputCard
                  input={input}
                  field={field}
                  mapping={mappingLookup.get(input.key)}
                  suggestion={sheetSuggestions.get(input.key)}
                  applyConfigDefault={applyConfigDefault}
                  applySheetSuggestion={applySheetSuggestion}
                  disabled={isBusy}
                />
              )}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isBusy}>
            {status === "processing" ? "Calculating…" : "Run calculation"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isBusy}
          >
            Reset inputs
          </Button>
          {status === "error" && (
            <span className="text-xs text-destructive-foreground">
              {error ??
                "Resolve the highlighted fields before running the calculation."}
            </span>
          )}
        </div>
      </form>
    </Form>
  );
}

type InputCardProps = {
  input: InputDefinition;
  field: ControllerRenderProps<CalculationFormValues, string>;
  mapping?: InputMappingInstance;
  suggestion?: string | number;
  applyConfigDefault: (inputKey: string) => void;
  applySheetSuggestion: (inputKey: string) => void;
  disabled: boolean;
};

function InputCard({
  input,
  field,
  mapping,
  suggestion,
  applyConfigDefault,
  applySheetSuggestion,
  disabled,
}: InputCardProps) {
  const { label, key, type } = input;

  const currentValue = field.value ? String(field.value) : "";

  const options = useMemo(
    () => buildOptions(input, currentValue, suggestion),
    [input, currentValue, suggestion]
  );

  return (
    <FormItem className="rounded-lg border border-border/60 bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <FormLabel className="text-sm font-semibold text-foreground">
            {label}
          </FormLabel>
          <p className="text-xs text-muted-foreground">
            {type} · key: {key}
          </p>
        </div>
        {mapping && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              mapping.source === "sheet"
                ? "bg-amber-100 text-amber-900"
                : mapping.source === "user"
                ? "bg-blue-100 text-blue-900"
                : "bg-emerald-100 text-emerald-900"
            )}
          >
            {formatSource(mapping.source)}
          </span>
        )}
      </div>

      <FormControl className="mt-4">
        {type === "enum" ? (
          <Select
            disabled={disabled}
            value={currentValue || undefined}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a value" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={type === "number" ? "number" : "text"}
            disabled={disabled}
            {...field}
          />
        )}
      </FormControl>

      <FormDescription className="mt-3 space-y-2 text-xs text-muted-foreground">
        <p>{formatConstraintSummary(input)}</p>
        <SuggestionLine
          input={input}
          mapping={mapping}
          suggestion={suggestion}
          disabled={disabled}
          applyConfigDefault={applyConfigDefault}
          applySheetSuggestion={applySheetSuggestion}
        />
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
}

type SuggestionLineProps = {
  input: InputDefinition;
  mapping?: InputMappingInstance;
  suggestion?: string | number;
  disabled: boolean;
  applyConfigDefault: (inputKey: string) => void;
  applySheetSuggestion: (inputKey: string) => void;
};

function SuggestionLine({
  input,
  mapping,
  suggestion,
  disabled,
  applyConfigDefault,
  applySheetSuggestion,
}: SuggestionLineProps) {
  const defaultDisplay = formatValue(input.defaultValue);
  const suggestionDisplay =
    suggestion !== undefined ? formatValue(suggestion) : undefined;

  return (
    <Fragment>
      <p>
        Default value: <span className="font-medium">{defaultDisplay}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => applyConfigDefault(input.key)}
        >
          Use config default
        </Button>
        {suggestionDisplay && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => applySheetSuggestion(input.key)}
          >
            Use sheet value ({suggestionDisplay})
          </Button>
        )}
        {mapping && mapping.source === "user" && (
          <span className="text-xs text-muted-foreground/80">
            Current value supplied by analyst
          </span>
        )}
      </div>
    </Fragment>
  );
}

function buildOptions(
  input: InputDefinition,
  currentValue: string,
  suggestion?: string | number
): string[] {
  if (input.type !== "enum") {
    return [];
  }

  const allowed = input.constraints?.allowedValues?.map((value) =>
    String(value)
  );

  const options = new Set<string>(allowed ?? []);

  if (suggestion !== undefined) {
    options.add(String(suggestion));
  }

  if (currentValue) {
    options.add(currentValue);
  }

  if (!options.size) {
    options.add("Option A");
    options.add("Option B");
  }

  return Array.from(options);
}

function formatSource(source: InputMappingInstance["source"]): string {
  switch (source) {
    case "sheet":
      return "Sheet value";
    case "user":
      return "User supplied";
    default:
      return "Config default";
  }
}
