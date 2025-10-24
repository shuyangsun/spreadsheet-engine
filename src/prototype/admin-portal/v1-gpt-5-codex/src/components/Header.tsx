import { CalendarClock, CloudUpload, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  onClear: () => void;
  onSave: () => void;
  lastSavedAt: Date | null;
  isSaving: boolean;
  totalInputs: number;
  totalOutputs: number;
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

export function Header({
  onClear,
  onSave,
  lastSavedAt,
  isSaving,
  totalInputs,
  totalOutputs,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <CloudUpload className="h-3.5 w-3.5" />
            <span>Spreadsheet Configuration</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Admin Portal Prototype
          </h1>
          <p className="text-sm text-muted-foreground">
            Map spreadsheet cells to API inputs and outputs with instant
            validation.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Badge
              variant="secondary"
              className="bg-secondary/60 text-secondary-foreground"
            >
              Inputs&nbsp;{totalInputs}
            </Badge>
            <Separator orientation="vertical" className="h-6" />
            <Badge
              variant="secondary"
              className="bg-secondary/60 text-secondary-foreground"
            >
              Outputs&nbsp;{totalOutputs}
            </Badge>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              {isSaving ? "Saving draft…" : formatTimestamp(lastSavedAt)}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-border/60 bg-background/60"
                onClick={onSave}
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Save Draft
              </Button>
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
