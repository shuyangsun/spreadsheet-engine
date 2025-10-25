import type {
  InputMappingInstance,
  PrototypeConfiguration,
  SheetSnapshot,
} from "./types";

export const SAMPLE_SHEET_LINK =
  "https://docs.google.com/spreadsheets/d/sample-prototype";

export const SAMPLE_CONFIGURATION: PrototypeConfiguration = {
  configId: "calc-engine-sample",
  title: "Q4 Pricing Scenario",
  inputs: [
    {
      key: "volume",
      label: "Monthly Volume",
      type: "number",
      defaultValue: 1250,
      constraints: {
        min: 500,
        max: 5000,
        step: 250,
        notes: "Volume must remain within quarterly fulfillment commitments.",
      },
      sheetMapping: {
        sheetId: "ops-snapshot",
        column: "C",
        row: 4,
      },
    },
    {
      key: "unitCost",
      label: "Unit Cost (USD)",
      type: "number",
      defaultValue: 14.75,
      constraints: {
        min: 10,
        max: 22,
        step: 0.25,
      },
      sheetMapping: {
        sheetId: "ops-snapshot",
        column: "D",
        row: 4,
      },
    },
    {
      key: "region",
      label: "Region",
      type: "enum",
      defaultValue: "North America",
      constraints: {
        allowedValues: ["North America", "Europe", "APAC"],
        notes: "Prototype currently assumes three rollout regions.",
      },
      sheetMapping: {
        sheetId: "ops-snapshot",
        column: "B",
        row: 2,
      },
    },
  ],
  outputs: [
    {
      key: "revenue",
      label: "Projected Revenue",
      description:
        "Monthly revenue calculated from volume and unit price assumptions.",
      calculation: "volume * unitCost * markup",
      units: "USD",
      notes: "Markup factor hardcoded in prototype.",
    },
    {
      key: "margin",
      label: "Gross Margin %",
      description: "Margin percentage after unit production cost assumptions.",
      calculation: "(revenue - (volume * baseCost)) / revenue",
      units: "%",
    },
  ],
  exploration: {
    inputKey: "volume",
    sampleCount: 7,
    strategy: "linear",
  },
};

export const SAMPLE_SHEET_SNAPSHOT: SheetSnapshot = {
  sheetId: "ops-snapshot",
  metadata: {
    tabName: "Prototype Snapshot",
    updatedAt: "2025-08-14T09:15:00.000Z",
  },
  rows: [
    {
      rowIndex: 2,
      cells: {
        A: "Region",
        B: "North America",
        C: 1500,
        D: 15.25,
      },
    },
    {
      rowIndex: 3,
      cells: {
        A: "Region",
        B: "Europe",
        C: 900,
        D: 13.1,
      },
    },
    {
      rowIndex: 4,
      cells: {
        A: "Region",
        B: "APAC",
        C: 1250,
        D: 14.75,
      },
    },
  ],
};

export const DEFAULT_INPUT_MAPPINGS: InputMappingInstance[] =
  SAMPLE_CONFIGURATION.inputs.map((input) => ({
    inputKey: input.key,
    currentValue: input.defaultValue,
    isValid: true,
    validationMessage: "",
    source: "configDefault",
  }));

export function matchSheetByLink(link: string): SheetSnapshot {
  return link.trim() ? SAMPLE_SHEET_SNAPSHOT : SAMPLE_SHEET_SNAPSHOT;
}
