/**
 * Demonstrates how to combine the shared JSON schema and TypeScript helpers
 * when validating imported configuration payloads in a Node environment.
 */
import { configurationSchema, validateImportedJson } from "../index";

// Consumers can feed any JSON string here (e.g., from a file or HTTP request).
const samplePayload = JSON.stringify(
  {
    version: "v1",
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: null,
      version: "v1",
      schemaVersion: "1.0",
      source: "example-script",
    },
    schemaVersion: "1.0",
    inputs: [
      {
        type: "input",
        sheetName: "Sheet1",
        cellId: "A1",
        label: "Principal",
        dataType: "currency",
        constraints: {
          type: "range",
          min: 1000,
          max: 1000000,
        },
      },
    ],
    outputs: [
      {
        type: "output",
        sheetName: "Sheet1",
        cellId: "B1",
        label: "Monthly Payment",
      },
    ],
  },
  null,
  2
);

console.info("Schema ID:", configurationSchema.$id);

const result = validateImportedJson(samplePayload);

if (!result.success) {
  console.error("Validation failed. Errors:");
  for (const message of result.errors) {
    console.error(`- ${message}`);
  }
} else {
  console.info("Validation succeeded. Normalized draft: ");
  console.dir(result.draft, { depth: null });
}
