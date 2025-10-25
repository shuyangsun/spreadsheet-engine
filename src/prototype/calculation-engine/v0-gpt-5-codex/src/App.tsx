import { useEffect, useMemo, useState } from "react";

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
import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-muted/60", className)} />;
}

const App = () => {
  const { isReady: isThemeReady } = useThemeStatus();
  const [phase, setPhase] = useState<"boot" | "ready">(
    isThemeReady ? "ready" : "boot"
  );

  useEffect(() => {
    if (!isThemeReady) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setPhase("ready"));

    return () => window.cancelAnimationFrame(frame);
  }, [isThemeReady]);

  const isLoading = phase === "boot";

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
            <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
              {isLoading ? "Bootstrapping..." : "Foundational ready"}
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
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <SkeletonBlock className="h-4 w-1/3" />
                  <SkeletonBlock className="h-10 w-full" />
                  <SkeletonBlock className="h-10 w-full" />
                  <SkeletonBlock className="h-4 w-2/5" />
                </div>
              ) : (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Config upload and sheet selection land here. Upcoming tasks
                    wire the form, simulated latency indicator, and validation
                    messaging.
                  </p>
                  <p>
                    Once connected, this card surfaces parsed metadata so
                    analysts can confirm staged resources before continuing.
                  </p>
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
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <SkeletonBlock className="h-4 w-1/4" />
                      <SkeletonBlock className="h-3 w-full" />
                      <SkeletonBlock className="h-3 w-11/12" />
                      <SkeletonBlock className="h-3 w-2/3" />
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        Overview will present staged inputs, defaults, and
                        validation feedback once the loader flow resolves.
                      </p>
                      <p>
                        Subsequent tasks replace this placeholder with
                        interactive controls and output summaries.
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="exploration" className="pt-4">
                  {isLoading ? (
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
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-3 w-full" />
                  <SkeletonBlock className="h-3 w-5/6" />
                  <SkeletonBlock className="h-3 w-2/3" />
                </div>
              ) : (
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Theme, Tailwind, and shared utilities are in place. User
                    Story 1 is the next milestone.
                  </p>
                  <Separator />
                  <ul className="space-y-3">
                    {milestones.map((milestone) => (
                      <li
                        key={milestone.tag}
                        className="flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {milestone.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {milestone.detail}
                          </p>
                        </div>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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

export default App;
