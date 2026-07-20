import { create } from "zustand";
import { runSimulation, type SimulationConfig, type SimulationPoint } from "../core/engine";

interface SimStore {
  config: SimulationConfig;
  result: SimulationPoint[];
  setConfig: (cfg: Partial<SimulationConfig>) => void;
  run: () => void;
}

export const useSimStore = create<SimStore>((set) => ({
  config: {
    initialValue: 10000,
    volatility: 0.1,
    scenario: "2008",
  },
  result: [],
  setConfig: (cfg) => set((state) => ({ config: { ...state.config, ...cfg } })),
  run: () =>
    set((state) => ({
      result: runSimulation(state.config),
    })),
}));
