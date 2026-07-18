import { useSimStore } from "../state/store";

export default function RunSimulationButton() {
  const run = useSimStore((s) => s.run);

  return <button onClick={run}>Run Simulation</button>;
}
