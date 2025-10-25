import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import type { Constraint, DataType } from "@/lib/types";

interface ConstraintsInputProps {
  value: Constraint | null;
  onChange: (value: Constraint | null) => void;
  dataType?: DataType | null;
}

const parseDiscreteValues = (raw: string) =>
  raw
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const rangeCapableTypes: DataType[] = [
  "number",
  "percentage",
  "currency",
  "date",
];

export function ConstraintsInput({
  value,
  onChange,
  dataType,
}: ConstraintsInputProps) {
  const rangeAllowed = !dataType || rangeCapableTypes.includes(dataType);
  const mode = value?.type ?? "none";
  const activeMode = rangeAllowed ? mode : mode === "range" ? "none" : mode;
  const discreteFromValue =
    value?.type === "discrete" ? value.values.join("\n") : "";
  const [discreteDraft, setDiscreteDraft] = useState<string>(
    () => discreteFromValue
  );
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!rangeAllowed && value?.type === "range") {
      onChange(null);
    }
  }, [rangeAllowed, value, onChange]);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    setDiscreteDraft(discreteFromValue);
  }, [value?.type, discreteFromValue]);

  const handleDiscreteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextRaw = event.target.value;
    isInternalUpdate.current = true;
    setDiscreteDraft(nextRaw);
    const entries = parseDiscreteValues(nextRaw);

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
    if (nextMode === "range" && !rangeAllowed) {
      return;
    }

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

  const minValue =
    value?.type === "range" && value.min !== null ? value.min : "";
  const maxValue =
    value?.type === "range" && value.max !== null ? value.max : "";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span>Constraints</span>
        {activeMode === "none" ? (
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
            {activeMode === "discrete" ? "Discrete values" : "Range"}
          </Badge>
        )}
      </div>
      <Tabs
        value={activeMode}
        onValueChange={handleModeChange}
        className="w-full"
      >
        <TabsList
          className={`grid w-full ${
            rangeAllowed ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          <TabsTrigger value="none">None</TabsTrigger>
          <TabsTrigger value="discrete">Discrete</TabsTrigger>
          {rangeAllowed && <TabsTrigger value="range">Range</TabsTrigger>}
        </TabsList>
        <TabsContent value="discrete" className="space-y-2">
          <Label htmlFor="constraint-discrete">Allowed Values</Label>
          <Textarea
            id="constraint-discrete"
            placeholder="Enter one value per line"
            value={discreteDraft}
            onChange={handleDiscreteChange}
            rows={4}
          />
        </TabsContent>
        {rangeAllowed && (
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
        )}
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
