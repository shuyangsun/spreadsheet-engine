import type { ChangeEvent } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import type { Constraint } from "@/lib/types";

interface ConstraintsInputProps {
  value: Constraint | null;
  onChange: (value: Constraint | null) => void;
}

const parseDiscreteValues = (raw: string) =>
  raw
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function ConstraintsInput({ value, onChange }: ConstraintsInputProps) {
  const mode = value?.type ?? "none";

  const handleDiscreteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const entries = parseDiscreteValues(event.target.value);

    if (entries.length === 0) {
      onChange(null);
      return;
    }

    onChange({
      type: "discrete",
      values: entries,
    });
  };

  const handleRangeChange =
    (field: "min" | "max") => (event: ChangeEvent<HTMLInputElement>) => {
      const current =
        value?.type === "range"
          ? value
          : ({ type: "range", min: null, max: null } as const);
      const nextValue = parseNumber(event.target.value);

      onChange({
        ...current,
        [field]: nextValue,
      });
    };

  const handleModeChange = (nextMode: string) => {
    if (nextMode === "none") {
      onChange(null);
      return;
    }

    if (nextMode === "discrete") {
      onChange({
        type: "discrete",
        values: value?.type === "discrete" ? value.values : [],
      });
      return;
    }

    onChange({
      type: "range",
      min: value?.type === "range" ? value.min : null,
      max: value?.type === "range" ? value.max : null,
    });
  };

  const discreteText =
    value?.type === "discrete" ? value.values.join("\n") : "";
  const minValue =
    value?.type === "range" && value.min !== null ? value.min : "";
  const maxValue =
    value?.type === "range" && value.max !== null ? value.max : "";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span>Constraints</span>
        {mode === "none" ? (
          <Badge
            variant="outline"
            className="border-border/50 text-muted-foreground"
          >
            Optional
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-secondary/60 text-secondary-foreground"
          >
            {mode === "discrete" ? "Discrete values" : "Range"}
          </Badge>
        )}
      </div>
      <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="none">None</TabsTrigger>
          <TabsTrigger value="discrete">Discrete</TabsTrigger>
          <TabsTrigger value="range">Range</TabsTrigger>
        </TabsList>
        <TabsContent value="discrete" className="space-y-2">
          <Label htmlFor="constraint-discrete">Allowed Values</Label>
          <Textarea
            id="constraint-discrete"
            placeholder="Enter one value per line or separate with commas"
            value={discreteText}
            onChange={handleDiscreteChange}
            rows={4}
          />
        </TabsContent>
        <TabsContent value="range" className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="constraint-min">Minimum</Label>
            <Input
              id="constraint-min"
              type="number"
              placeholder="Min"
              value={minValue}
              onChange={handleRangeChange("min")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="constraint-max">Maximum</Label>
            <Input
              id="constraint-max"
              type="number"
              placeholder="Max"
              value={maxValue}
              onChange={handleRangeChange("max")}
            />
          </div>
        </TabsContent>
        <TabsContent value="none">
          <p className="text-sm text-muted-foreground">
            Leave constraints unset to accept any value provided by
            administrators.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
