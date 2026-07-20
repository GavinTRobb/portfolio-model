import { randomShock } from "./math";
import { scenarios } from "./scenarios";

export interface SimulationConfig {
  initialValue: number;
  volatility: number;
  scenario: string;
}

export interface SimulationPoint {
  t: number;
  value: number;
}

export function runSimulation(cfg: SimulationConfig): SimulationPoint[] {
  const result: SimulationPoint[] = [];
  let value = cfg.initialValue;

  for (let i = 0; i < 100; i++) {
    const s = scenarios.find((scenario) => scenario.id === cfg.scenario);
    if (!s) {
      break;
    }
    const shock = s.shock + randomShock(cfg.volatility);
    value = value * (1 + shock);
    result.push({ t: i, value });
  }

  return result;
}
