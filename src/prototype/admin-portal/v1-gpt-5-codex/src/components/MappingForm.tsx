import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { DataType } from "@/lib/types";

interface OutputFormValues {
  sheetName: string;
  cellId: string;
  label: string;
}

interface InputFormValues extends OutputFormValues {
  dataType: DataType;
}

type MappingFormProps =
  | {
      type: "input";
      onSubmit: (values: InputFormValues) => void;
    }
  | {
      type: "output";
      onSubmit: (values: OutputFormValues) => void;
    };

const initialState: OutputFormValues = {
  sheetName: "",
  cellId: "",
  label: "",
};

const dataTypes: DataType[] = [
  "number",
  "text",
  "percentage",
  "currency",
  "date",
];

export function MappingForm(props: MappingFormProps) {
  const { type } = props;
  const [formValues, setFormValues] = useState<OutputFormValues>(initialState);
  const [dataType, setDataType] = useState<DataType>("number");
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof OutputFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({
        ...current,
        [field]:
          field === "cellId"
            ? event.target.value.toUpperCase()
            : event.target.value,
      }));
      setError(null);
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed: OutputFormValues = {
      sheetName: formValues.sheetName.trim(),
      cellId: formValues.cellId.trim().toUpperCase(),
      label: formValues.label.trim(),
    };

    if (!trimmed.sheetName || !trimmed.cellId || !trimmed.label) {
      setError("Please complete all required fields before adding a mapping.");
      return;
    }

    if (type === "input") {
      props.onSubmit({
        ...trimmed,
        dataType,
      });
    } else {
      props.onSubmit(trimmed);
    }

    setFormValues(initialState);
    setDataType("number");
    setError(null);
  };

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>
            {type === "input" ? "Add Input Mapping" : "Add Output Mapping"}
          </span>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground/80">
          {type === "input"
            ? "Inputs require a data type and can optionally include constraints."
            : "Outputs reference cells whose values will be returned by the API."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor={`${type}-sheet`}>Sheet *</Label>
            <Input
              id={`${type}-sheet`}
              placeholder="e.g. Loan Calculator"
              value={formValues.sheetName}
              onChange={handleChange("sheetName")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${type}-cell`}>Cell *</Label>
            <Input
              id={`${type}-cell`}
              placeholder="e.g. B2"
              value={formValues.cellId}
              onChange={handleChange("cellId")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${type}-label`}>Display Label *</Label>
            <Input
              id={`${type}-label`}
              placeholder="e.g. Loan Amount"
              value={formValues.label}
              onChange={handleChange("label")}
            />
          </div>
          {type === "input" && (
            <div className="grid gap-2">
              <Label htmlFor={`${type}-datatype`}>Data Type *</Label>
              <Select
                value={dataType}
                onValueChange={(value: DataType) => setDataType(value)}
              >
                <SelectTrigger id={`${type}-datatype`}>
                  <SelectValue placeholder="Select a data type" />
                </SelectTrigger>
                <SelectContent>
                  {dataTypes.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground"
            >
              Done
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export type { InputFormValues, OutputFormValues };
