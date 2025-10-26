import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CalculationStatus } from "@/hooks/useCalculationForm";
import type {
  OutputDefinition,
  OutputScenario,
  PrototypeConfiguration,
} from "@/lib/types";
import { formatCurrency, formatDecimal, formatPercent } from "@/lib/utils";

export type OutputSummaryProps = {
  configuration?: PrototypeConfiguration;
  scenario?: OutputScenario;
  status: CalculationStatus;
  lastSubmittedAt?: number;
};

export function OutputSummary({
  configuration,
  scenario,
  status,
  lastSubmittedAt,
}: OutputSummaryProps) {
  if (!configuration) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Output summary</CardTitle>
          <CardDescription>
            Load a configuration and run a calculation to preview outputs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceholderMessage label="Outputs will appear here once available." />
        </CardContent>
      </Card>
    );
  }

  if (status === "processing") {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Output summary</CardTitle>
          <CardDescription>
            Crunching the hardcoded prototype logic…
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-1/3 rounded-md bg-muted/60" />
            <div className="h-3 w-1/4 rounded-md bg-muted/40" />
            <div className="h-20 rounded-lg bg-muted/30" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scenario) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Output summary</CardTitle>
          <CardDescription>
            Adjust inputs and run the calculation to view prototype outputs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceholderMessage label="No runs yet." />
        </CardContent>
      </Card>
    );
  }

  const resultLookup = new Map(
    scenario.results.map((entry) => [entry.outputKey, entry])
  );

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Output summary</CardTitle>
        <CardDescription>
          Results generated from the current input set.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            <p>Scenario ID</p>
            <p className="font-medium text-foreground">{scenario.scenarioId}</p>
          </div>
          <div>
            <p>Ran at</p>
            <p className="font-medium text-foreground">
              {formatTimestamp(lastSubmittedAt ?? Date.now())}
            </p>
          </div>
        </header>

        <Separator />

        <ul className="space-y-4">
          {configuration.outputs.map((output) => {
            const result = resultLookup.get(output.key);

            return (
              <li
                key={output.key}
                className="rounded-md border border-border/60 bg-card/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {output.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {output.description}
                    </p>
                  </div>
                  <p className="text-base font-semibold text-primary">
                    {formatOutputValue(output, result?.displayValue)}
                  </p>
                </div>

                {(output.notes || result?.explanation) && (
                  <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                    {output.notes && <p>Note: {output.notes}</p>}
                    {result?.explanation && <p>{result.explanation}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function formatOutputValue(
  definition: OutputDefinition,
  value: string | number | undefined
): string {
  if (value === undefined || value === null) {
    return "—";
  }

  if (typeof value === "number") {
    if (definition.units?.toLowerCase() === "usd") {
      return formatCurrency(value, "USD");
    }

    if (definition.units?.includes("%")) {
      return formatPercent(value);
    }

    return formatDecimal(value, 2);
  }

  return value;
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function PlaceholderMessage({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-border/70 bg-muted/10 p-6 text-sm text-muted-foreground">
      {label}
    </div>
  );
}
