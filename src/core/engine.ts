import { randomShock } from "./math";
import { scenarios } from "./scenarios";

export function runSimulation(cfg) {
  const result = [];
  let value = cfg.initialValue;

  for (let i = 0; i < 100; i++) {
    const s = scenarios.find(x => x.id === cfg.scenario);
    const shock = s.shock + randomShock(cfg.volatility);
    value = value * (1 + shock);
    result.push({ t: i, value });
  }

  return result;
}
