import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
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

interface HeaderProps {
  onClear: () => void;
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

export function Header({ onClear, lastSavedAt, isSaving }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Spreadsheet Configuration
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground"></div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              {isSaving ? "Saving draft…" : formatTimestamp(lastSavedAt)}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    Clear Draft
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Reset this configuration?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will clear the current draft and restore the
                      sample configuration. You can&apos;t undo this operation.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onClear}>
                      Reset Draft
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
