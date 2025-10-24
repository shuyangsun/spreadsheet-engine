import type {
  DraftConfiguration,
  InputMapping,
  OutputMapping,
} from "@/lib/types";
import { createId } from "@/lib/utils";

const buildInput = (mapping: Omit<InputMapping, "id">): InputMapping => ({
  ...mapping,
  id: createId(),
});

const buildOutput = (mapping: Omit<OutputMapping, "id">): OutputMapping => ({
  ...mapping,
  id: createId(),
});

export const sampleConfiguration = (): DraftConfiguration => ({
  version: "1.0",
  inputs: [
    buildInput({
      sheetName: "Loan Calculator",
      cellId: "B2",
      label: "Loan Amount",
      type: "input",
      dataType: "currency",
      constraints: {
        type: "range",
        min: 1000,
        max: 1000000,
      },
    }),
    buildInput({
      sheetName: "Loan Calculator",
      cellId: "B3",
      label: "Loan Term (years)",
      type: "input",
      dataType: "number",
      constraints: {
        type: "discrete",
        values: ["15", "20", "30"],
      },
    }),
    buildInput({
      sheetName: "Loan Calculator",
      cellId: "B4",
      label: "Annual Interest Rate",
      type: "input",
      dataType: "percentage",
      constraints: {
        type: "range",
        min: 0,
        max: 20,
      },
    }),
  ],
  outputs: [
    buildOutput({
      sheetName: "Loan Calculator",
      cellId: "B6",
      label: "Monthly Payment",
      type: "output",
      dataType: null,
      constraints: null,
    }),
    buildOutput({
      sheetName: "Loan Calculator",
      cellId: "B7",
      label: "Total Interest Paid",
      type: "output",
      dataType: null,
      constraints: null,
    }),
  ],
  metadata: {
    createdAt: new Date().toISOString(),
    version: "v1",
  },
});
