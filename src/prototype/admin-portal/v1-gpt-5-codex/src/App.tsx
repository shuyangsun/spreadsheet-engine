import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { Header } from "@/components/Header";
import {
  MappingForm,
  type InputFormValues,
  type OutputFormValues,
} from "@/components/MappingForm";
import { MappingCard } from "@/components/MappingCard";
import { ExportDialog } from "@/components/ExportDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

import {
  clearConfiguration,
  loadConfiguration,
  saveConfiguration,
} from "@/lib/storage";
import { createId } from "@/lib/utils";
import { toExportConfiguration, validateConfiguration } from "@/lib/validation";
import type {
  Constraint,
  DraftConfiguration,
  InputMapping,
  OutputMapping,
  ValidationError,
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
  const [exportOpen, setExportOpen] = useState(false);
  const [exportJson, setExportJson] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [showInputForm, setShowInputForm] = useState(false);
  const [showOutputForm, setShowOutputForm] = useState(false);

  const { toast } = useToast();

  const clearValidationErrors = () => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

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
    clearValidationErrors();

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
    clearValidationErrors();

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
    clearValidationErrors();

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
    clearValidationErrors();

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
    clearValidationErrors();

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

  const handleManualSave = () => {
    saveConfiguration(configuration);
    setLastSavedAt(new Date());
    setIsSaving(false);

    toast({
      title: "Draft saved",
      description: "Your configuration has been persisted to this browser.",
    });
  };

  const handleClearDraft = () => {
    clearValidationErrors();

    clearConfiguration();
    const reset = createExampleConfiguration();
    setConfiguration(reset);
    setLastSavedAt(null);
    setValidationErrors([]);

    toast({
      title: "Draft reset",
      description: "Sample configuration restored.",
    });
  };

  const handleGenerateJson = () => {
    const result = validateConfiguration(configuration);

    if (!result.isValid) {
      setValidationErrors(result.errors);
      toast({
        variant: "destructive",
        title: "Validation failed",
        description: `${result.errors.length} issue${
          result.errors.length === 1 ? "" : "s"
        } require attention before export.`,
      });
      return;
    }

    const exportPayload = toExportConfiguration(configuration);
    const json = JSON.stringify(exportPayload, null, 2);
    setExportJson(json);
    setExportOpen(true);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      toast({
        title: "JSON copied",
        description: "Configuration has been copied to your clipboard.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Copy failed",
        description:
          "Your browser blocked clipboard access. Please download the file instead.",
      });
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `configuration-${new Date().toISOString()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description:
        "Check your downloads folder for the exported configuration.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        onClear={handleClearDraft}
        onSave={handleManualSave}
        lastSavedAt={lastSavedAt}
        isSaving={isSaving}
        totalInputs={totalInputs}
        totalOutputs={totalOutputs}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="border-destructive/60">
            <AlertTitle className="text-base font-semibold">
              Please resolve validation errors
            </AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={`${error.field ?? "error"}-${index}`}>
                    {error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Input mappings
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
                    Add Input
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
                <MappingForm type="input" onSubmit={handleAddInput} />
              )}
              {sortedInputs.length === 0 ? (
                <EmptyState message="No input mappings yet. Use Add Input to configure your first mapping." />
              ) : (
                <div className="grid gap-4">
                  {sortedInputs.map((mapping) => (
                    <MappingCard
                      key={mapping.id}
                      mapping={mapping}
                      onUpdate={handleUpdateMapping}
                      onConstraintChange={handleConstraintChange}
                      onRemove={handleRemoveMapping}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Output mappings
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
                    Add Output
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
                <MappingForm type="output" onSubmit={handleAddOutput} />
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
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg border border-border/60 bg-card/50 p-4 text-sm leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">Prototype notes</p>
              <Separator className="my-3" />
              <ul className="space-y-2">
                <li>All changes auto-save locally after a short pause.</li>
                <li>
                  Constraints can be toggled per input from each mapping card.
                </li>
                <li>
                  Use Generate JSON to validate before sharing the
                  configuration.
                </li>
              </ul>
            </div>
          </aside>
        </section>

        <Separator className="border-border/60" />

        <div className="flex flex-col items-end gap-3">
          <p className="text-sm text-muted-foreground">
            Valid JSON exports include metadata and enforce the specification
            contract.
          </p>
          <Button
            size="lg"
            className="bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/20"
            onClick={handleGenerateJson}
          >
            Generate JSON
          </Button>
        </div>
      </main>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        json={exportJson}
        onCopy={handleCopyJson}
        onDownload={handleDownloadJson}
      />

      <Toaster />
    </div>
  );
}

export default App;
