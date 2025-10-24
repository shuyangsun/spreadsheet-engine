import type { ChangeEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConstraintsInput } from "@/components/ConstraintsInput";

import type {
  Constraint,
  DataType,
  InputMapping,
  Mapping,
  OutputMapping,
} from "@/lib/types";
import { cn } from "@/lib/utils";

import { Trash2 } from "lucide-react";

interface MappingCardProps {
  mapping: Mapping;
  onUpdate: (
    id: string,
    updates: Partial<InputMapping> | Partial<OutputMapping>
  ) => void;
  onConstraintChange: (id: string, constraint: Constraint | null) => void;
  onRemove: (id: string) => void;
  errors?: string[];
}

const dataTypes: DataType[] = [
  "number",
  "text",
  "percentage",
  "currency",
  "date",
];

const dataTypeStyles: Record<DataType, string> = {
  number: "border-sky-400/60 bg-sky-500/15 text-sky-300",
  text: "border-amber-400/60 bg-amber-500/15 text-amber-300",
  percentage: "border-emerald-400/60 bg-emerald-500/15 text-emerald-300",
  currency: "border-indigo-400/60 bg-indigo-500/15 text-indigo-300",
  date: "border-rose-400/60 bg-rose-500/15 text-rose-300",
};

export function MappingCard({
  mapping,
  onUpdate,
  onRemove,
  onConstraintChange,
  errors = [],
}: MappingCardProps) {
  const isInput = mapping.type === "input";
  const isExampleLabel = mapping.label.toLowerCase().includes("example");
  const errorMessages = errors.filter(Boolean);
  const hasErrors = errorMessages.length > 0;

  const handleFieldChange =
    (field: keyof Mapping) => (event: ChangeEvent<HTMLInputElement>) => {
      onUpdate(mapping.id, {
        [field]:
          field === "cellId"
            ? event.target.value.toUpperCase()
            : event.target.value,
      } as Partial<InputMapping> | Partial<OutputMapping>);
    };

  const handleDataTypeChange = (value: DataType) => {
    if (!isInput) {
      return;
    }

    onUpdate(mapping.id, {
      dataType: value,
    } as Partial<InputMapping>);
  };

  const handleConstraintChange = (constraint: Constraint | null) => {
    if (!isInput) {
      return;
    }

    onConstraintChange(mapping.id, constraint);
  };

  return (
    <div
      className={cn(
        hasErrors &&
          "rounded-xl bg-destructive/15 p-[1px] shadow-[0_8px_16px_-12px_rgba(220,38,38,0.45)]"
      )}
    >
      <Card
        className={cn(
          "overflow-hidden border border-border/60 bg-card/60 transition-colors",
          hasErrors && "border-destructive/60"
        )}
      >
        <Accordion type="single" collapsible>
          <AccordionItem value={`item-${mapping.id}`}>
            <AccordionTrigger className="bg-card/80 px-6 py-4 hover:no-underline">
              <div className="flex w-full items-center justify-between gap-6 text-left">
                <div className="flex flex-col">
                  <span className="text-base font-medium text-foreground">
                    {mapping.label || "Untitled mapping"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {mapping.sheetName || "Unnamed sheet"} •{" "}
                    {mapping.cellId || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {isExampleLabel && (
                    <Badge
                      variant="outline"
                      className="border-amber-400/70 text-amber-400"
                    >
                      Example
                    </Badge>
                  )}
                  {isInput && (mapping as InputMapping).dataType && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        dataTypeStyles[(mapping as InputMapping).dataType]
                      )}
                    >
                      {(mapping as InputMapping).dataType}
                    </Badge>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove this mapping?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This mapping will be deleted from the
                                configuration. You can add it again later if
                                needed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onRemove(mapping.id)}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TooltipTrigger>
                      <TooltipContent>Remove mapping</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`${mapping.id}-sheet`}>Sheet</Label>
                    <Input
                      id={`${mapping.id}-sheet`}
                      value={mapping.sheetName}
                      onChange={handleFieldChange("sheetName")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`${mapping.id}-cell`}>Cell</Label>
                    <Input
                      id={`${mapping.id}-cell`}
                      value={mapping.cellId}
                      onChange={handleFieldChange("cellId")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`${mapping.id}-label`}>Display Label</Label>
                    <Input
                      id={`${mapping.id}-label`}
                      value={mapping.label}
                      onChange={handleFieldChange("label")}
                    />
                  </div>
                </div>
                <div className="grid gap-4">
                  {isInput ? (
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`${mapping.id}-datatype`}>
                          Data Type
                        </Label>
                        <Select
                          value={(mapping as InputMapping).dataType}
                          onValueChange={handleDataTypeChange}
                        >
                          <SelectTrigger id={`${mapping.id}-datatype`}>
                            <SelectValue placeholder="Select a data type" />
                          </SelectTrigger>
                          <SelectContent>
                            {dataTypes.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option.charAt(0).toUpperCase() +
                                  option.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <ConstraintsInput
                        value={(mapping as InputMapping).constraints}
                        onChange={handleConstraintChange}
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                      Output mappings inherit the spreadsheet value directly. No
                      additional configuration needed.
                    </div>
                  )}
                </div>
              </div>
              <Separator className="my-6" />
              <ScrollArea className="max-h-32 rounded-md border border-border/40 bg-muted/10 p-4 text-xs text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Note:</span>{" "}
                  Changes are captured immediately and saved to your draft. Use
                  the JSON preview panel to monitor validation and download the
                  configuration whenever it passes checks.
                </p>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {hasErrors && (
          <div className="flex items-start gap-3 border-t border-destructive/40 bg-destructive/15 px-6 py-4 text-sm text-destructive-foreground">
            <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-destructive-foreground" />
            <div className="space-y-1">
              {errorMessages.map((message, index) => (
                <p key={`${mapping.id}-error-${index}`}>{message}</p>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
