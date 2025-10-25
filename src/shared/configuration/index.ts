import schemaJson from "./configuration.schema.json" assert { type: "json" };

export * from "./types";
export * from "./identifiers";
export * from "./transforms";
export * from "./validation";

export const configurationSchema = schemaJson;
