export type InputType = "number" | "text" | "enum";

export type Constraints = {
  min?: number;
  max?: number;
  allowedValues?: Array<string | number>;
  step?: number;
  notes?: string;
};

export type SheetMapping = {
  sheetId: string;
  column: string;
  row?: number;
};

export type InputDefinition = {
  key: string;
  label: string;
  type: InputType;
  defaultValue: string | number;
  constraints?: Constraints;
  sheetMapping?: SheetMapping;
};

export type OutputDefinition = {
  key: string;
  label: string;
  description: string;
  calculation: string;
  units?: string;
  notes?: string;
};

export type ExplorationSpec = {
  inputKey: string;
  sampleCount: number;
  strategy?: "linear" | "logarithmic";
};

export type PrototypeConfiguration = {
  configId: string;
  title: string;
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  exploration?: ExplorationSpec;
};

export type SheetRow = {
  rowIndex: number;
  cells: Record<string, string | number>;
};

export type SheetSnapshot = {
  sheetId: string;
  metadata: {
    tabName: string;
    updatedAt: string;
  };
  rows: SheetRow[];
};

export type InputValueSource = "configDefault" | "sheet" | "user";

export type InputMappingInstance = {
  inputKey: string;
  currentValue: string | number;
  isValid: boolean;
  validationMessage: string;
  source: InputValueSource;
};

export type ResultValue = {
  outputKey: string;
  displayValue: string | number;
  explanation?: string;
};

export type OutputScenario = {
  scenarioId: string;
  timestamp: string;
  results: ResultValue[];
  explorationSeries?: ExplorationPoint[];
};

export type ExplorationPoint = {
  inputValue: number;
  outputValues: Record<string, number>;
  label: string;
};

export type ConfigLoadResponse = {
  configuration: PrototypeConfiguration;
  inputs: InputMappingInstance[];
  sheetSnapshot?: SheetSnapshot;
};

export type ValidationIssue = {
  field: string;
  message: string;
};

export type ValidationError = {
  message: string;
  issues: ValidationIssue[];
};

export type SheetSelection = {
  link: string;
  simulatedDataset: SheetSnapshot;
};

export type SimulationLatencyConfig = {
  minDelayMs: number;
  maxDelayMs: number;
};

export type ExplorationDataset = {
  input: InputDefinition;
  points: ExplorationPoint[];
};
