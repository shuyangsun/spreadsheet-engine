import { useEffect, useState } from "react";

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Delay UI rendering until theme tokens apply to prevent flash of unstyled content.
    const frame = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Spreadsheet Engine
            </p>
            <h1 className="text-xl font-semibold">
              Calculation Engine Prototype
            </h1>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            v0 · draft
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-lg border bg-card p-8 text-card-foreground">
          <h2 className="text-lg font-semibold">Work in progress</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The interactive calculation engine workflow is under construction.
            Core utilities, sample data, and UI primitives are ready; component
            wiring lands next.
          </p>
        </section>
      </main>
    </div>
  );
};

export default App;
