import { simulateLatency } from "./simulation";
import type {
  OutputDefinition,
  OutputScenario,
  PrototypeConfiguration,
} from "./types";

export type CalculationInputRecord = Record<string, string | number>;

export type CalculationOptions = {
  latencyMs?: {
    min: number;
    max: number;
  };
};

const DEFAULT_CALCULATION_LATENCY = {
  min: 260,
  max: 640,
};

const REGION_MARKUP: Record<string, number> = {
  "north america": 1.18,
  europe: 1.12,
  apac: 1.15,
};

const SURGE_FACTORS: number[] = [1, 0.96, 1.04, 1.08];

export async function runPrototypeCalculation(
  configuration: PrototypeConfiguration,
  values: CalculationInputRecord,
  options?: CalculationOptions
): Promise<OutputScenario> {
  const latency = options?.latencyMs ?? DEFAULT_CALCULATION_LATENCY;

  await simulateLatency({
    minDelayMs: latency.min,
    maxDelayMs: latency.max,
  });

  const results = configuration.outputs.map((output) => {
    const { value, explanation } = computeOutputValue(output, values);

    return {
      outputKey: output.key,
      displayValue: value,
      explanation,
    };
  });

  return {
    scenarioId: createScenarioId(values),
    timestamp: new Date().toISOString(),
    results,
  } satisfies OutputScenario;
}

function computeOutputValue(
  definition: OutputDefinition,
  values: CalculationInputRecord
): { value: number | string; explanation?: string } {
  switch (definition.key) {
    case "revenue": {
      const volume = getNumber(values.volume, 0);
      const unitCost = getNumber(values.unitCost, 0);
      const region = getString(values.region, "north america");
      const markup = REGION_MARKUP[region.toLowerCase()] ?? 1.1;
      const surge = SURGE_FACTORS[volume % SURGE_FACTORS.length | 0];
      const total = volume * unitCost * markup * surge;

      return {
        value: roundCurrency(total),
        explanation: `Includes regional markup (${Math.round(
          (markup - 1) * 100
        )}% uplift) and simulated demand surge.`,
      };
    }
    case "margin": {
      const revenue = getNumber(values.revenue, undefined);
      const volume = getNumber(values.volume, 0);
      const unitCost = getNumber(values.unitCost, 0);
      const fallbackRevenue = volume * unitCost * 1.1;
      const effectiveRevenue = Number.isFinite(revenue)
        ? revenue
        : fallbackRevenue;
      const baseProductionCost = unitCost * 0.78;
      const productionTotal = volume * baseProductionCost;

      if (!effectiveRevenue) {
        return { value: 0, explanation: "Revenue is zero in this scenario." };
      }

      const margin = (effectiveRevenue - productionTotal) / effectiveRevenue;

      return {
        value: clampPercent(margin),
        explanation: "Assumes production cost at 78% of unit cost baseline.",
      };
    }
    default: {
      const synthetic = synthesizeFallbackMetric(definition, values);

      return {
        value: synthetic.value,
        explanation: synthetic.explanation,
      };
    }
  }
}

function synthesizeFallbackMetric(
  definition: OutputDefinition,
  values: CalculationInputRecord
): { value: number; explanation: string } {
  const numericValues = Object.values(values).filter(
    (entry): entry is number =>
      typeof entry === "number" && Number.isFinite(entry)
  );

  const base =
    numericValues.length > 0
      ? numericValues.reduce((sum, entry) => sum + entry, 0)
      : definition.label.length * 7;

  const modulation = definition.calculation
    ? definition.calculation.length
    : definition.label.length;

  const value = roundCurrency((base * modulation) / 100);

  return {
    value,
    explanation: "Generated with prototype synthetic fallback logic.",
  };
}

function createScenarioId(values: CalculationInputRecord): string {
  const entropySeed = Object.keys(values)
    .sort()
    .map((key) => `${key}:${values[key]}`)
    .join("|");

  const hash = simpleHash(entropySeed);

  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${crypto.randomUUID()}-${hash}`;
  }

  return `scenario-${Date.now()}-${hash}`;
}

function simpleHash(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0; // convert to 32-bit integer
  }

  return Math.abs(hash).toString(16);
}

function getNumber(
  value: string | number | undefined,
  fallback: number = 0
): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function getString(
  value: string | number | undefined,
  fallback: string
): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const bounded = Math.max(-1, Math.min(1, value));
  return Math.round(bounded * 1000) / 1000;
}
