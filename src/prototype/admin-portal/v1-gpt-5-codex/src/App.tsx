import { useEffect, useMemo, useState } from "react";
import { Download, Plus, X } from "lucide-react";

import { Header } from "@/components/Header";
import {
  MappingForm,
  type InputFormValues,
  type OutputFormValues,
} from "@/components/MappingForm";
import { MappingCard } from "@/components/MappingCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

import { loadConfiguration, saveConfiguration } from "@/lib/storage";
import { createId } from "@/lib/utils";
import { toExportConfiguration, validateConfiguration } from "@/lib/validation";
import type {
  Constraint,
  DraftConfiguration,
  InputMapping,
  OutputMapping,
} from "@/lib/types";

const makeLocationKey = (sheetName: string, cellId: string) =>
  `${sheetName.trim().toLowerCase()}::${cellId.trim().toUpperCase()}`;

const createExampleConfiguration = (): DraftConfiguration => ({
  version: "1.0",
  inputs: [
    {
      id: createId("example-input"),
      type: "input",
      sheetName: "Loan Calculator",
      cellId: "B2",
      label: "Example Input: Loan Amount",
      dataType: "currency",
      constraints: null,
    },
  ],
  outputs: [
    {
      id: createId("example-output"),
      type: "output",
      sheetName: "Loan Calculator",
      cellId: "B6",
      label: "Example Output: Monthly Payment",
      dataType: null,
      constraints: null,
    },
  ],
  metadata: {
    createdAt: new Date().toISOString(),
    version: "v1",
  },
});

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function App() {
  const [configuration, setConfiguration] = useState<DraftConfiguration>(() =>
    createExampleConfiguration()
  );
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showInputForm, setShowInputForm] = useState(false);
  const [showOutputForm, setShowOutputForm] = useState(false);

  const { toast } = useToast();

  const liveValidation = useMemo(
    () => validateConfiguration(configuration),
    [configuration]
  );

  const mappingErrors = useMemo(() => {
    const errorsByMapping: Record<string, string[]> = {};
    const allMappings = [...configuration.inputs, ...configuration.outputs];

    const descriptors = allMappings.map((mapping) => {
      const trimmedLabel = mapping.label.trim();
      const trimmedSheet = mapping.sheetName.trim();
      const normalizedCell = mapping.cellId.trim().toUpperCase();
      const locationDescriptor = `${trimmedSheet} ${normalizedCell}`;
      const descriptor = trimmedLabel || locationDescriptor;
      const constraintKey = `${trimmedLabel} constraint`;

      const keys = new Set<string>();
      keys.add(mapping.id.toLowerCase());

      if (trimmedLabel) {
        keys.add(trimmedLabel.toLowerCase());
      }

      if (descriptor) {
        keys.add(descriptor.toLowerCase());
      }

      if (locationDescriptor) {
        keys.add(locationDescriptor.toLowerCase());
      }

      if (trimmedLabel || constraintKey.trim()) {
        keys.add(constraintKey.toLowerCase());
      }

      return {
        id: mapping.id,
        keys,
      };
    });

    for (const error of liveValidation.errors) {
      if (!error.field) {
        continue;
      }

      const normalizedField = error.field.toLowerCase();

      for (const descriptor of descriptors) {
        if (!descriptor.keys.has(normalizedField)) {
          continue;
        }

        if (!errorsByMapping[descriptor.id]) {
          errorsByMapping[descriptor.id] = [];
        }

        if (!errorsByMapping[descriptor.id].includes(error.message)) {
          errorsByMapping[descriptor.id].push(error.message);
        }
      }
    }

    return errorsByMapping;
  }, [configuration.inputs, configuration.outputs, liveValidation.errors]);

  const previewJson = useMemo(
    () => JSON.stringify(toExportConfiguration(configuration), null, 2),
    [configuration]
  );

  const mostRecentInputSheet = useMemo(() => {
    if (configuration.inputs.length === 0) {
      return "";
    }

    return configuration.inputs[0].sheetName.trim();
  }, [configuration.inputs]);

  const mostRecentOutputSheet = useMemo(() => {
    if (configuration.outputs.length === 0) {
      return "";
    }

    return configuration.outputs[0].sheetName.trim();
  }, [configuration.outputs]);

  useEffect(() => {
    const stored = loadConfiguration();

    if (stored) {
      setConfiguration(stored);
      setLastSavedAt(new Date());
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    setIsSaving(true);

    const handle = window.setTimeout(() => {
      saveConfiguration(configuration);
      setLastSavedAt(new Date());
      setIsSaving(false);
    }, 500);

    return () => window.clearTimeout(handle);
  }, [configuration, hasLoaded]);

  const sortedInputs = useMemo(
    () => configuration.inputs,
    [configuration.inputs]
  );

  const sortedOutputs = useMemo(
    () => configuration.outputs,
    [configuration.outputs]
  );

  const totalInputs = configuration.inputs.length;
  const totalOutputs = configuration.outputs.length;

  const handleAddInput = (values: InputFormValues) => {
    const key = makeLocationKey(values.sheetName, values.cellId);
    const exists = [...configuration.inputs, ...configuration.outputs].some(
      (mapping) => makeLocationKey(mapping.sheetName, mapping.cellId) === key
    );

    if (exists) {
      toast({
        variant: "destructive",
        title: "Duplicate cell location",
        description: "A mapping already exists for that sheet and cell.",
      });
      return;
    }

    const mapping: InputMapping = {
      id: createId("input"),
      type: "input",
      sheetName: values.sheetName,
      cellId: values.cellId,
      label: values.label,
      dataType: values.dataType,
      constraints: null,
    };

    setConfiguration((current) => ({
      ...current,
      inputs: [mapping, ...current.inputs],
    }));

    setShowInputForm(false);

    toast({
      title: "Input mapping added",
      description: `${values.label} is now configured as an input.`,
    });
  };

  const handleAddOutput = (values: OutputFormValues) => {
    const key = makeLocationKey(values.sheetName, values.cellId);
    const exists = [...configuration.inputs, ...configuration.outputs].some(
      (mapping) => makeLocationKey(mapping.sheetName, mapping.cellId) === key
    );

    if (exists) {
      toast({
        variant: "destructive",
        title: "Duplicate cell location",
        description: "A mapping already exists for that sheet and cell.",
      });
      return;
    }

    const mapping: OutputMapping = {
      id: createId("output"),
      type: "output",
      sheetName: values.sheetName,
      cellId: values.cellId,
      label: values.label,
      dataType: null,
      constraints: null,
    };

    setConfiguration((current) => ({
      ...current,
      outputs: [mapping, ...current.outputs],
    }));

    setShowOutputForm(false);

    toast({
      title: "Output mapping added",
      description: `${values.label} will be exported as an output.`,
    });
  };

  const handleUpdateMapping = (
    id: string,
    updates: Partial<InputMapping> | Partial<OutputMapping>
  ) => {
    setConfiguration((current) => ({
      ...current,
      inputs: current.inputs.map((mapping) =>
        mapping.id === id
          ? { ...mapping, ...(updates as Partial<InputMapping>) }
          : mapping
      ),
      outputs: current.outputs.map((mapping) =>
        mapping.id === id
          ? { ...mapping, ...(updates as Partial<OutputMapping>) }
          : mapping
      ),
    }));
  };

  const handleConstraintChange = (
    id: string,
    constraint: Constraint | null
  ) => {
    setConfiguration((current) => ({
      ...current,
      inputs: current.inputs.map((mapping) =>
        mapping.id === id
          ? {
              ...mapping,
              constraints: constraint,
            }
          : mapping
      ),
    }));
  };

  const handleRemoveMapping = (id: string) => {
    const mapping = [...configuration.inputs, ...configuration.outputs].find(
      (item) => item.id === id
    );

    setConfiguration((current) => ({
      ...current,
      inputs: current.inputs.filter((item) => item.id !== id),
      outputs: current.outputs.filter((item) => item.id !== id),
    }));

    if (mapping) {
      toast({
        title: "Mapping removed",
        description: `${mapping.label} has been removed from the configuration.`,
      });
    }
  };

  const handleDownloadJson = (
    json: string,
    filenamePrefix = "configuration"
  ) => {
    if (!liveValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Download blocked",
        description: "Resolve configuration issues before exporting.",
      });
      return;
    }

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filenamePrefix}-${new Date().toISOString()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description:
        "Check your downloads folder for the exported configuration.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header lastSavedAt={lastSavedAt} isSaving={isSaving} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:flex-1 lg:min-h-0 lg:flex-row lg:items-stretch lg:gap-10 lg:px-10">
        <section className="flex flex-1 flex-col gap-8 lg:min-h-0 lg:overflow-y-auto lg:pr-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Inputs
                </h2>
                <Button
                  variant={showInputForm ? "secondary" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setShowInputForm(true);
                    setShowOutputForm(false);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {showInputForm && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setShowInputForm(false)}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {totalInputs} configured
              </span>
            </div>
            {showInputForm && (
              <MappingForm
                type="input"
                onSubmit={handleAddInput}
                defaultSheetName={mostRecentInputSheet || undefined}
              />
            )}
            {sortedInputs.length === 0 ? (
              <EmptyState message="No input yet. Use Add Input to configure your first mapping." />
            ) : (
              <div className="grid gap-4">
                {sortedInputs.map((mapping) => (
                  <MappingCard
                    key={mapping.id}
                    mapping={mapping}
                    onUpdate={handleUpdateMapping}
                    onConstraintChange={handleConstraintChange}
                    onRemove={handleRemoveMapping}
                    errors={mappingErrors[mapping.id] ?? []}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Outputs
                </h2>
                <Button
                  variant={showOutputForm ? "secondary" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setShowOutputForm(true);
                    setShowInputForm(false);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {showOutputForm && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setShowOutputForm(false)}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {totalOutputs} configured
              </span>
            </div>
            {showOutputForm && (
              <MappingForm
                type="output"
                onSubmit={handleAddOutput}
                defaultSheetName={mostRecentOutputSheet || undefined}
              />
            )}
            {sortedOutputs.length === 0 ? (
              <EmptyState message="No outputs configured yet. Use Add Output to capture calculated cells." />
            ) : (
              <div className="grid gap-4">
                {sortedOutputs.map((mapping) => (
                  <MappingCard
                    key={mapping.id}
                    mapping={mapping}
                    onUpdate={handleUpdateMapping}
                    onConstraintChange={handleConstraintChange}
                    onRemove={handleRemoveMapping}
                    errors={mappingErrors[mapping.id] ?? []}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="lg:flex lg:h-[85vh] lg:w-[360px] lg:flex-shrink-0 lg:min-h-0">
          <div className="rounded-lg border border-border/60 bg-card/50 p-4 text-sm text-muted-foreground lg:flex lg:h-full lg:min-h-0 lg:flex-col">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-foreground">Configuration</p>
              <Badge
                variant={liveValidation.isValid ? "success" : "destructive"}
                className="whitespace-nowrap"
              >
                {liveValidation.isValid ? "Ready" : "Needs fixes"}
              </Badge>
            </div>
            <Separator className="my-3" />
            {!liveValidation.isValid && (
              <div className="mb-3 space-y-2 rounded-md border border-destructive/60 bg-destructive/10 p-3 text-xs text-destructive-foreground">
                <p className="font-semibold text-destructive-foreground">
                  Resolve validation issues
                </p>
                <ul className="space-y-1">
                  {liveValidation.errors.slice(0, 3).map((error, index) => (
                    <li key={`${error.field ?? "error"}-${index}`}>
                      {error.message}
                    </li>
                  ))}
                </ul>
                {liveValidation.errors.length > 3 && (
                  <p className="text-[11px] text-destructive-foreground/80">
                    +{liveValidation.errors.length - 3} more issue
                    {liveValidation.errors.length - 3 === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            )}
            <div className="mt-3 flex-1 lg:min-h-0">
              <ScrollArea className="h-[240px] rounded-md border border-border/60 bg-muted/10 p-3 lg:h-full">
                <pre className="text-xs leading-relaxed text-muted-foreground">
                  <code>{previewJson}</code>
                </pre>
              </ScrollArea>
            </div>
            <Button
              size="sm"
              className="mt-4 w-full mb-2 lg:mb-4"
              onClick={() => handleDownloadJson(previewJson)}
              disabled={!liveValidation.isValid}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </aside>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
