import { test, expect } from "vitest";
import { runSimulation } from "../core/engine";

test("simulation returns 100 data points", () => {
  const r = runSimulation({
    initialValue: 10000,
    volatility: 0.1,
    scenario: "2008",
  });

  expect(r.length).toBe(100);
});
