export type DataType = "number" | "text" | "percentage" | "currency" | "date";

export type VersionTag = `v${number}`;

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
}

export type Mapping = InputMapping | OutputMapping;

export interface ConfigurationMetadata {
  createdAt: string;
  updatedAt: string | null;
  version: VersionTag;
  schemaVersion?: string | null;
  source?: string | null;
}

export interface DraftConfiguration {
  inputs: InputMapping[];
  outputs: OutputMapping[];
  metadata: ConfigurationMetadata;
}

export interface ExportInputMapping {
  type: "input";
  sheetName: string;
  cellId: string;
  label: string;
  dataType: DataType;
  constraints?: Constraint | null;
}

export interface ExportOutputMapping {
  type: "output";
  sheetName: string;
  cellId: string;
  label: string;
}

export interface ExportConfiguration {
  version: VersionTag;
  inputs: ExportInputMapping[];
  outputs: ExportOutputMapping[];
  metadata: ConfigurationMetadata;
  schemaVersion?: string | null;
}

export interface ImportBaseline {
  snapshot: ExportConfiguration;
  importedAt: string;
  sourceFileName: string | null;
  schemaVersion: string | null;
}

export interface DraftBundle {
  configuration: DraftConfiguration;
  importBaseline: ImportBaseline | null;
}

export interface ValidationError {
  field?: string;
  message: string;
}
