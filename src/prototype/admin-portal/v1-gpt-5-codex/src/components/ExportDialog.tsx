import { Copy, Download } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  json: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function ExportDialog({
  open,
  onOpenChange,
  json,
  onCopy,
  onDownload,
}: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-background/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            Export Configuration
            <Badge variant="outline" className="border-primary/60 text-primary">
              JSON
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review the generated configuration before copying it to the
            clipboard or downloading as a file.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />
        <ScrollArea className="max-h-[420px] rounded-md border border-border/60 bg-muted/10 p-4">
          <pre className="overflow-x-auto text-sm leading-relaxed text-muted-foreground">
            <code>{json}</code>
          </pre>
        </ScrollArea>
        <DialogFooter className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onCopy}
            className="border-border/60"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
          </Button>
          <Button onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" /> Download JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
