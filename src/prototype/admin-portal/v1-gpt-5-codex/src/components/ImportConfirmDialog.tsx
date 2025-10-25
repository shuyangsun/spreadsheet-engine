import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ImportConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onDownloadCurrent: () => void;
  onDiscardAndContinue: () => void;
}

export function ImportConfirmDialog({
  open,
  onCancel,
  onDownloadCurrent,
  onDiscardAndContinue,
}: ImportConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onCancel()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved edits?</AlertDialogTitle>
          <AlertDialogDescription>
            Importing a new configuration will replace your in-progress changes.
            Download the current JSON if you want to keep a copy before
            importing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <Button variant="outline" onClick={onDownloadCurrent}>
            Download current JSON
          </Button>
          <AlertDialogAction onClick={onDiscardAndContinue}>
            Discard &amp; Import
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
