import Layout from "./components/Layout";
import PortfolioConfig from "./components/PortfolioConfig";
import ScenarioSelector from "./components/ScenarioSelector";
import RunSimulationButton from "./components/RunSimulationButton";
import ChartView from "./components/ChartView";

export default function App() {
  return (
    <Layout>
      <div className="dashboard-box">Top Left</div>
      <div className="dashboard-box">Top Center</div>
      <div className="dashboard-box">Top Right</div>

      <div className="dashboard-box">
        <PortfolioConfig />
        <ScenarioSelector />
        <RunSimulationButton />
      </div>

      <div className="dashboard-box">
        <ChartView />
      </div>

      <div className="dashboard-box">Bottom Right</div>
    </Layout>
  );
}

