import { useMemo } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  InputDefinition,
  InputMappingInstance,
  PrototypeConfiguration,
  SheetSnapshot,
} from "@/lib/types";

export type InputOverviewPanelProps = {
  configuration?: PrototypeConfiguration;
  inputs?: InputMappingInstance[];
  sheetSnapshot?: SheetSnapshot;
  sheetLink?: string;
  isLoading?: boolean;
};

export function InputOverviewPanel({
  configuration,
  inputs,
  sheetSnapshot,
  sheetLink,
  isLoading = false,
}: InputOverviewPanelProps) {
  const inputMap = useMemo(() => {
    if (!inputs) {
      return new Map<string, InputMappingInstance>();
    }

    return new Map(inputs.map((mapping) => [mapping.inputKey, mapping]));
  }, [inputs]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-5 w-40 rounded-md bg-muted/60" />
        <div className="h-3 w-3/5 rounded-md bg-muted/50" />
        <div className="h-3 w-2/5 rounded-md bg-muted/40" />
        <div className="h-64 rounded-lg bg-muted/30" />
      </div>
    );
  }

  if (!configuration || !inputs) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
        Load a configuration to review input mappings and defaults.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold leading-tight text-foreground">
              {configuration.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {configuration.inputs.length} inputs ·{" "}
              {configuration.outputs.length} outputs
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
            Config {configuration.configId}
          </span>
        </div>
        {sheetSnapshot && (
          <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/10 p-3 text-xs text-muted-foreground sm:grid-cols-3">
            <div>
              <p className="font-medium text-foreground">Sheet link</p>
              <p className="truncate text-xs text-muted-foreground/80">
                {sheetLink ?? "Sample sheet"}
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Tab name</p>
              <p>{sheetSnapshot.metadata.tabName}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Updated</p>
              <p>{formatTimestamp(sheetSnapshot.metadata.updatedAt)}</p>
            </div>
          </div>
        )}
      </header>

      <Separator />

      <ScrollArea className="h-[24rem] rounded-lg border border-border/60 bg-card/40 p-4">
        <ul className="space-y-4">
          {configuration.inputs.map((input) => {
            const mapping = inputMap.get(input.key);
            return (
              <li
                key={input.key}
                className="rounded-md border border-border/70 bg-card/90 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {input.label}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {input.type} · key: {input.key}
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
                      {formatSourceLabel(mapping.source)}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Current value
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {mapping ? formatValue(mapping.currentValue) : "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/80">
                      Validation:{" "}
                      {mapping?.isValid
                        ? "Ready"
                        : mapping?.validationMessage ?? "Needs review"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Default value
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatValue(input.defaultValue)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/80">
                      {formatConstraintSummary(input)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatValue(value: string | number): string {
  if (typeof value === "number") {
    const formatter = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 3,
    });
    return formatter.format(value);
  }

  return value;
}

function formatSourceLabel(source: InputMappingInstance["source"]): string {
  switch (source) {
    case "sheet":
      return "Sheet default";
    case "user":
      return "User supplied";
    default:
      return "Config default";
  }
}

function formatConstraintSummary(input: InputDefinition): string {
  const { constraints } = input;

  if (!constraints) {
    return "No constraints configured";
  }

  if (constraints.allowedValues && constraints.allowedValues.length > 0) {
    return `Allowed values: ${constraints.allowedValues
      .map((value) => formatValue(value))
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
