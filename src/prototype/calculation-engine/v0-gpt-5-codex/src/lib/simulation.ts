import type {
  PrototypeConfiguration,
  SheetSnapshot,
  SimulationLatencyConfig,
} from "./types";

const DEFAULT_LATENCY: SimulationLatencyConfig = {
  minDelayMs: 900,
  maxDelayMs: 2200,
};

export async function simulateLatency(
  override?: Partial<SimulationLatencyConfig>
): Promise<void> {
  const config = {
    ...DEFAULT_LATENCY,
    ...override,
  } satisfies SimulationLatencyConfig;

  const delta = config.maxDelayMs - config.minDelayMs;
  const delay = config.minDelayMs + Math.random() * Math.max(delta, 0);

  await new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export async function simulateConfigLoad(
  configuration: PrototypeConfiguration,
  sheet: SheetSnapshot,
  options?: { latency?: Partial<SimulationLatencyConfig> }
): Promise<{ configuration: PrototypeConfiguration; sheet: SheetSnapshot }> {
  await simulateLatency(options?.latency);
  return { configuration, sheet };
}

export async function simulateSheetPreview(
  sheet: SheetSnapshot,
  options?: { latency?: Partial<SimulationLatencyConfig> }
): Promise<SheetSnapshot> {
  await simulateLatency(options?.latency);
  return sheet;
}
