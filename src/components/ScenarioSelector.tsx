import { useSimStore } from "../state/store";

export default function ScenarioSelector() {
  const cfg = useSimStore((s) => s.config);

  return (
    <div>
      <h3>Scenario</h3>
      <div>Current: {cfg.scenario}</div>
    </div>
  );
}
