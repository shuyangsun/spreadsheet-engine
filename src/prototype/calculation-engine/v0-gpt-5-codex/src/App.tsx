import { useEffect, useMemo, useState } from "react";

import { ConfigUploadForm } from "@/components/ConfigUploadForm";
import { InputOverviewPanel } from "@/components/InputOverviewPanel";
import { InputControls } from "@/components/InputControls";
import { OutputSummary } from "@/components/OutputSummary";
import { useThemeStatus } from "@/components/theme-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfigLoader } from "@/hooks/useConfigLoader";
import { useCalculationForm } from "@/hooks/useCalculationForm";
import type { ConfigLoadResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-muted/60", className)} />;
}

const App = () => {
  const { isReady: isThemeReady } = useThemeStatus();
  const {
    status: loaderStatus,
    data: loaderData,
    error: loaderError,
    meta: loaderMeta,
    statusLabel,
    loadFromUpload,
    loadSample,
    reset: resetLoader,
  } = useConfigLoader();
  const [phase, setPhase] = useState<"boot" | "ready">(
    isThemeReady ? "ready" : "boot"
  );

  const currentData: ConfigLoadResponse | undefined = loaderData;

  const calculation = useCalculationForm({
    configuration: currentData?.configuration,
    initialInputs: currentData?.inputs,
    sheetSnapshot: currentData?.sheetSnapshot,
  });

  useEffect(() => {
    if (!isThemeReady) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setPhase("ready"));

    return () => window.cancelAnimationFrame(frame);
  }, [isThemeReady]);

  const isBooting = phase === "boot";
  const busy = isBooting || loaderStatus === "loading";

  const milestones = useMemo(
    () => [
      {
        label: "Config intake",
        tag: "US1",
        detail: "Upload JSON and simulate sheet latency",
      },
      {
        label: "Input capture",
        tag: "US2",
        detail: "Constrain edits and recompute outputs",
      },
      {
        label: "Exploration",
        tag: "US3",
        detail: "Sweep a single variable and plot results",
      },
    ],
    []
  );

  const headerStatus = useMemo(() => {
    if (isBooting) {
      return { label: "Bootstrapping theme", tone: "default" as const };
    }

    switch (loaderStatus) {
      case "loading":
        return { label: "Loading configuration…", tone: "pending" as const };
      case "success":
        return { label: "Configuration ready", tone: "success" as const };
      case "error":
        return { label: "Needs attention", tone: "error" as const };
      default:
        return { label: "Awaiting resources", tone: "default" as const };
    }
  }, [isBooting, loaderStatus]);

  const statusItems = useMemo(
    () => [
      {
        label: "Theme & layout",
        detail: isBooting ? "Initializing" : "Ready",
        tone: isBooting ? "pending" : "success",
      },
      {
        label: "Configuration",
        detail: statusLabel,
        tone:
          loaderStatus === "success"
            ? "success"
            : loaderStatus === "error"
            ? "error"
            : loaderStatus === "loading"
            ? "pending"
            : "default",
      },
      {
        label: "Input capture",
        detail:
          loaderStatus !== "success"
            ? "Waiting for configuration"
            : calculation.status === "success"
            ? "Outputs refreshed"
            : calculation.status === "processing"
            ? "Running calculation"
            : "Ready",
        tone:
          loaderStatus !== "success"
            ? "default"
            : calculation.status === "success"
            ? "success"
            : calculation.status === "processing"
            ? "pending"
            : calculation.status === "error"
            ? "error"
            : "default",
      },
    ],
    [calculation.status, isBooting, loaderStatus, statusLabel]
  );

  const handleUpload = (payload: { file: File; sheetLink: string }) => {
    loadFromUpload(payload);
  };

  const handleSample = (sheetLink?: string) => {
    loadSample({ sheetLink });
  };

  const handleReset = () => {
    resetLoader();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Spreadsheet Engine
            </p>
            <h1 className="text-xl font-semibold leading-tight">
              Calculation Engine Prototype
            </h1>
          </div>
          <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <span
              className={cn(
                "rounded-full px-3 py-1 font-medium",
                headerStatus.tone === "success" &&
                  "bg-emerald-100 text-emerald-900",
                headerStatus.tone === "error" &&
                  "bg-destructive/10 text-destructive-foreground",
                headerStatus.tone === "pending" &&
                  "bg-amber-100 text-amber-900",
                headerStatus.tone === "default" &&
                  "bg-muted text-muted-foreground"
              )}
            >
              {headerStatus.label}
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
              v0 - draft
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row lg:gap-8">
        <section className="flex flex-1 flex-col gap-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Configuration loader</CardTitle>
              <CardDescription>
                Upload the bundled JSON config and link a simulated sheet to
                begin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isBooting ? (
                <div className="space-y-4 animate-pulse">
                  <SkeletonBlock className="h-4 w-1/3" />
                  <SkeletonBlock className="h-10 w-full" />
                  <SkeletonBlock className="h-10 w-full" />
                  <SkeletonBlock className="h-4 w-2/5" />
                </div>
              ) : (
                <div className="space-y-6">
                  {loaderStatus === "success" && loaderMeta && currentData && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900">
                      <p className="font-medium">Configuration staged</p>
                      <div className="mt-2 space-y-1">
                        <p>File: {loaderMeta.fileName}</p>
                        <p>
                          Sheet link: {loaderMeta.sheetLink ?? "Sample sheet"}
                        </p>
                        {loaderMeta.completedAt && loaderMeta.startedAt && (
                          <p>
                            Load time:{" "}
                            {formatDuration(
                              loaderMeta.completedAt - loaderMeta.startedAt
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {loaderStatus === "error" && loaderError && (
                    <div className="rounded-md border border-destructive/60 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                      <p className="font-semibold">{loaderError.title}</p>
                      {loaderError.details &&
                        loaderError.details.length > 0 && (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                            {loaderError.details.map((detail) => (
                              <li key={detail}>{detail}</li>
                            ))}
                          </ul>
                        )}
                      <button
                        type="button"
                        className="mt-3 text-xs font-medium text-destructive underline-offset-4 hover:underline"
                        onClick={handleReset}
                      >
                        Reset loader
                      </button>
                    </div>
                  )}

                  <ConfigUploadForm
                    status={loaderStatus}
                    defaultSheetLink={loaderMeta?.sheetLink}
                    onSubmit={handleUpload}
                    onUseSample={handleSample}
                    disabled={loaderStatus === "loading"}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Workspace</CardTitle>
              <CardDescription>
                Review mappings, capture inputs, and inspect outputs as flows
                come online.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Tabs defaultValue="overview" className="flex flex-col">
                <TabsList className="w-fit">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="exploration">Exploration</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-4">
                  <div className="space-y-6">
                    <InputOverviewPanel
                      configuration={currentData?.configuration}
                      inputs={calculation.mappings ?? currentData?.inputs}
                      sheetSnapshot={currentData?.sheetSnapshot}
                      sheetLink={loaderMeta?.sheetLink}
                      isLoading={busy}
                    />

                    <InputControls
                      configuration={currentData?.configuration}
                      form={calculation.form}
                      onSubmit={calculation.submit}
                      onReset={calculation.reset}
                      status={calculation.status}
                      disabled={busy || loaderStatus !== "success"}
                      mappings={calculation.mappings}
                      sheetSuggestions={calculation.sheetSuggestions}
                      applyConfigDefault={calculation.applyConfigDefault}
                      applySheetSuggestion={calculation.applySheetSuggestion}
                      error={calculation.error}
                    />

                    <OutputSummary
                      configuration={currentData?.configuration}
                      scenario={calculation.scenario}
                      status={calculation.status}
                      lastSubmittedAt={calculation.lastSubmittedAt}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="exploration" className="pt-4">
                  {busy ? (
                    <div className="space-y-4 animate-pulse">
                      <SkeletonBlock className="h-4 w-1/5" />
                      <SkeletonBlock className="h-3 w-full" />
                      <SkeletonBlock className="h-52 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        Exploration tools will let analysts sweep a single input
                        and inspect the resulting outputs in chart and table
                        form.
                      </p>
                      <p>
                        Placeholder copy remains until the dedicated exploration
                        tasks land.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <aside className="w-full lg:w-80">
          <Card className="lg:sticky lg:top-6">
            <CardHeader className="space-y-1">
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Track foundational setup and upcoming checkpoints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isBooting ? (
                <div className="space-y-4 animate-pulse">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-3 w-full" />
                  <SkeletonBlock className="h-3 w-5/6" />
                  <SkeletonBlock className="h-3 w-2/3" />
                </div>
              ) : (
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Theme, Tailwind, and shared utilities are in place. Config
                    loader brings the first user story online.
                  </p>
                  <Separator />
                  <ul className="space-y-3">
                    {statusItems.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.detail}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
                            item.tone === "success" &&
                              "bg-emerald-100 text-emerald-900",
                            item.tone === "error" &&
                              "bg-destructive/10 text-destructive-foreground",
                            item.tone === "pending" &&
                              "bg-amber-100 text-amber-900",
                            item.tone === "default" &&
                              "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.tone === "success"
                            ? "Ready"
                            : item.tone === "error"
                            ? "Issue"
                            : item.tone === "pending"
                            ? "Pending"
                            : "TBD"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  <ul className="space-y-3">
                    {milestones.map((milestone) => (
                      <li
                        key={milestone.tag}
                        className="flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {milestone.label}
                          </p>
                          <p className="text-muted-foreground">
                            {milestone.detail}
                          </p>
                        </div>
                        <span className="rounded-full bg-muted px-2 py-0.5 font-medium uppercase tracking-wide text-muted-foreground">
                          {milestone.tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
};

function formatDuration(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return "< 1 ms";
  }

  if (durationMs < 1000) {
    return `${Math.round(durationMs)} ms`;
  }

  const seconds = durationMs / 1000;
  return `${seconds.toFixed(1)} s`;
}

export default App;
