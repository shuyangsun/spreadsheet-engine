export type DataType = "number" | "text" | "percentage" | "currency" | "date";

export type Constraint =
  | {
      type: "discrete";
      values: string[];
    }
  | {
      type: "range";
      min: number | null;
      max: number | null;
    };

export type MappingType = "input" | "output";

export interface BaseMapping {
  id: string;
  sheetName: string;
  cellId: string;
  label: string;
  type: MappingType;
}

export interface InputMapping extends BaseMapping {
  type: "input";
  dataType: DataType;
  constraints: Constraint | null;
}

export interface OutputMapping extends BaseMapping {
  type: "output";
  dataType: null;
  constraints: null;
}

export type Mapping = InputMapping | OutputMapping;

export interface ConfigurationMetadata {
  createdAt: string;
  version: string;
}

export interface DraftConfiguration {
  version: "1.0";
  inputs: InputMapping[];
  outputs: OutputMapping[];
  metadata: ConfigurationMetadata;
}

export interface ExportConfiguration {
  version: "1.0";
  inputs: Array<Omit<InputMapping, "id">>;
  outputs: Array<Omit<OutputMapping, "id">>;
  metadata: ConfigurationMetadata;
}

export interface ValidationError {
  field?: string;
  message: string;
}
