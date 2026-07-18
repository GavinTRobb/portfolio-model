import { useSimStore } from "../state/store";

export default function PortfolioConfig() {
  const cfg = useSimStore((s) => s.config);
  const setConfig = useSimStore((s) => s.setConfig);

  return (
    <div>
      <h3>Portfolio Config</h3>
      <div>Initial Value: {cfg.initialValue}</div>
      <div>Volatility: {cfg.volatility}</div>
    </div>
  );
}
