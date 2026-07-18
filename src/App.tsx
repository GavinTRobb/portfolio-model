import { useState } from "react";

import PortfolioControlsPanel from "./components/PortfolioControlsPanel";
import CrashYearPanel from "./components/CrashYearPanel";
import DrawdownPanel from "./components/DrawdownPanel";
import GrowthByYearPanel from "./components/GrowthByYearPanel";
import NavPerYearPanel from "./components/NavPerYearPanel";
import NavChartPanel from "./components/NavChartPanel";

import "./components/layout.css";
import "./components/controls.css";

function App() {
  const [portfolioValue, setPortfolioValue] = useState(3500000);

  const [crashYear, setCrashYear] = useState(1);
  const [crashPercent, setCrashPercent] = useState(45);
  const [interestRateChange, setInterestRateChange] = useState(-2);

  const [drawdownYear, setDrawdownYear] = useState(2028);
  const [drawdownAmount, setDrawdownAmount] = useState(300000);

  const [period, setPeriod] = useState(25);

  const [equityRate, setEquityRate] = useState(8.0);
  const [bondRate, setBondRate] = useState(3.5);
  const [mmfRate, setMmfRate] = useState(1.5);

  const [equityAlloc, setEquityAlloc] = useState(20);
  const [bondAlloc, setBondAlloc] = useState(40);
  const [mmfAlloc, setMmfAlloc] = useState(20);

  const [resetTrigger, setResetTrigger] = useState(0);

  const [growthTable, setGrowthTable] = useState([]);
  const [navRows, setNavRows] = useState([]);

  return (
    <div className="layout-wrapper">
      <div className="layout-grid">

        <div className="dashboard-box">
          <PortfolioControlsPanel
            onApply={(settings) => {
              setEquityRate(settings.equity);
              setBondRate(settings.bonds);
              setMmfRate(settings.mmf);

              setEquityAlloc(settings.equityAlloc);
              setBondAlloc(settings.bondAlloc);
              setMmfAlloc(settings.mmfAlloc);

              setResetTrigger((v) => v + 1);
            }}
            portfolio={portfolioValue}
            crashYear={crashYear}
          />
        </div>

        <div className="dashboard-box">
          <CrashYearPanel
            portfolio={portfolioValue}
            onPortfolioChange={setPortfolioValue}
            crashYear={crashYear}
            onCrashYearChange={setCrashYear}
            crashPercent={crashPercent}
            onCrashPercentChange={setCrashPercent}
            interestRateChange={interestRateChange}
            onInterestRateChange={setInterestRateChange}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>

        <div className="dashboard-box">
          <DrawdownPanel
            drawdownYear={drawdownYear}
            onDrawdownYearChange={setDrawdownYear}
            drawdownAmount={drawdownAmount}
            onDrawdownAmountChange={setDrawdownAmount}
            onApply={() => setResetTrigger((v) => v + 1)}
          />
        </div>

        <div className="dashboard-box">
          <GrowthByYearPanel
            period={period}
            equityRate={equityRate}
            bondRate={bondRate}
            mmfRate={mmfRate}
            resetTrigger={resetTrigger}
            onApplyGrowth={(rows) => setGrowthTable(rows)}
          />
        </div>

        <div className="dashboard-box">
          <NavChartPanel navRows={navRows} />
        </div>

        <div className="dashboard-box">
          <NavPerYearPanel
            period={period}
            portfolio={portfolioValue}
            equityAlloc={equityAlloc}
            bondAlloc={bondAlloc}
            mmfAlloc={mmfAlloc}
            drawdownYear={drawdownYear}
            drawdownAmount={drawdownAmount}
            growthTable={growthTable}
            resetTrigger={resetTrigger}
            onNavChange={setNavRows}
          />
        </div>

      </div>
    </div>
  );
}

export default App;
