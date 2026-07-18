import { create } from "zustand";
import { runSimulation } from "../core/engine";

export const useSimStore = create((set) => ({
  config: {
    initialValue: 10000,
    volatility: 0.1,
    scenario: "2008",
  },
  result: [],
  setConfig: (cfg) => set({ config: { ...cfg } }),
  run: () =>
    set((state) => ({
      result: runSimulation(state.config),
    })),
}));
