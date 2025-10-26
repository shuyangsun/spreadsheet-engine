import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SAMPLE_SHEET_LINK } from "@/lib/sample-data";

export type ConfigUploadFormValues = {
  sheetLink: string;
  configFile: FileList | null;
};

export type ConfigUploadFormProps = {
  status: "idle" | "loading" | "success" | "error";
  defaultSheetLink?: string;
  onSubmit: (payload: { file: File; sheetLink: string }) => void;
  onUseSample: (sheetLink?: string) => void;
  disabled?: boolean;
};

export function ConfigUploadForm({
  status,
  defaultSheetLink,
  onSubmit,
  onUseSample,
  disabled = false,
}: ConfigUploadFormProps) {
  const form = useForm<ConfigUploadFormValues>({
    defaultValues: {
      sheetLink: defaultSheetLink ?? SAMPLE_SHEET_LINK,
      configFile: null,
    },
  });

  const lastUploadedFileRef = useRef<File | null>(null);

  const isLoading = status === "loading" || disabled;

  const submitLabel = useMemo(() => {
    switch (status) {
      case "loading":
        return "Loading…";
      case "success":
        return "Reload configuration";
      default:
        return "Load configuration";
    }
  }, [status]);

  const handleSubmit = form.handleSubmit((values) => {
    const file = values.configFile?.[0] ?? lastUploadedFileRef.current;

    if (!file) {
      form.setError("configFile", {
        type: "manual",
        message: "Select a configuration file before loading.",
      });
      return;
    }

    form.clearErrors("configFile");
    lastUploadedFileRef.current = file;

    onSubmit({
      file,
      sheetLink: values.sheetLink.trim(),
    });
  });

  const handleSample = () => {
    const sheetLink = form.getValues("sheetLink").trim();
    onUseSample(sheetLink || undefined);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="configFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Configuration file</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="application/json"
                  disabled={isLoading}
                  onChange={(event) => {
                    const files = event.target.files;
                    field.onChange(files ?? null);

                    if (!files || files.length === 0) {
                      return;
                    }

                    const sheetLinkValue = form.getValues("sheetLink").trim();

                    if (!sheetLinkValue) {
                      form.setError("sheetLink", {
                        type: "manual",
                        message:
                          "Enter a sheet link before uploading a configuration.",
                      });
                      return;
                    }

                    form.clearErrors("sheetLink");
                    form.clearErrors("configFile");

                    const selectedFile = files[0];
                    lastUploadedFileRef.current = selectedFile;

                    onSubmit({
                      file: selectedFile,
                      sheetLink: sheetLinkValue,
                    });

                    form.setValue("configFile", null, { shouldDirty: false });
                    event.target.value = "";
                  }}
                />
              </FormControl>
              <FormDescription>
                Upload the JSON export from the admin portal prototype. Loading
                starts immediately after the file is selected; no extra
                confirmation required.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sheetLink"
          rules={{ required: "Enter a sheet link or use the sample value." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Sheet link</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://docs.google.com/spreadsheets/..."
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The prototype maps this link to the bundled sheet snapshot to
                mimic real latency.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isLoading}>
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSample}
            disabled={isLoading}
          >
            Use sample data
          </Button>
        </div>
      </form>
    </Form>
  );
}
