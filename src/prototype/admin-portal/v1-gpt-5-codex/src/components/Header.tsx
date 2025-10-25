import { CalendarClock } from "lucide-react";

interface HeaderProps {
  lastSavedAt: Date | null;
  isSaving: boolean;
}

const formatTimestamp = (timestamp: Date | null) => {
  if (!timestamp) {
    return "Draft never saved";
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `Saved ${formatter.format(timestamp)}`;
};

export function Header({ lastSavedAt, isSaving }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur"
      data-app-header
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Spreadsheet Configuration
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          {isSaving ? "Saving draft…" : formatTimestamp(lastSavedAt)}
        </div>
      </div>
    </header>
  );
}
