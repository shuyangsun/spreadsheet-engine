/**
 * Quick manual smoke test for the configuration import flow.
 * Run with: npx ts-node --project tsconfig.app.json src/lib/__smoke__/import-flow.ts
 */
import { sampleConfiguration } from "../sample-data.ts";
import { normalizeExportConfiguration } from "../utils.ts";
import { validateImportedJson } from "../validation.ts";

const draft = sampleConfiguration();
const snapshot = normalizeExportConfiguration(draft);
const raw = JSON.stringify(snapshot, null, 2);

const result = validateImportedJson(raw);

if (!result.success) {
  console.error("Import validation failed", result.errors);
} else {
  console.log("Import validation succeeded");
}
