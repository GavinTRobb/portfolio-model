import { useState, useMemo } from "react";

import PortfolioControlsPanel from "./components/PortfolioControlsPanel";
import CrashYearPanel from "./components/CrashYearPanel";
import DrawdownPanel from "./components/DrawdownPanel";
import GrowthByYearPanel from "./components/GrowthByYearPanel";
import NavPerYearPanel from "./components/NavPerYearPanel";
import NavChartPanel from "./components/NavChartPanel";

import "./components/layout.css";
import "./components/controls.css";

function App() {
  // GLOBAL START YEAR = current year + 1
  const currentYear = new Date().getFullYear();
  const startYear = currentYear + 1;

  // MAIN STATE
  const [portfolioValue, setPortfolioValue] = useState(3500000);
  const [age, setAge] = useState(55);
  const [period, setPeriod] = useState(25);

  // CRASH
  const [crashYear, setCrashYear] = useState(startYear);
  const [crashPercent, setCrashPercent] = useState(45);
  const [interestRateChange, setInterestRateChange] = useState(-2);

  // DRAWDOWN
  const [drawdownStartYear, setDrawdownStartYear] = useState(startYear);
  const [drawdownYear, setDrawdownYear] = useState(startYear + 1);
  const [drawdownAmount, setDrawdownAmount] = useState(300000);
  const [drawdownOverrides, setDrawdownOverrides] = useState<number[]>([]);

  // GROWTH + ALLOCATIONS
  const [equityRate, setEquityRate] = useState(8.0);
  const [bondRate, setBondRate] = useState(3.5);
  const [mmfRate, setMmfRate] = useState(1.5);

  const [equityAlloc, setEquityAlloc] = useState(20);
  const [bondAlloc, setBondAlloc] = useState(40);
  const [mmfAlloc, setMmfAlloc] = useState(20);

  const [growthAdjustments, setGrowthAdjustments] = useState<
    Array<{ year: number; equity: number; bonds: number; mmf: number }>
  >([]);
  const [growthRatesResetKey, setGrowthRatesResetKey] = useState(0);

  // AUTO-CORRECT RULES
  const correctedCrashYear = Math.max(crashYear, startYear);
  const correctedDrawdownStart = Math.max(drawdownStartYear, startYear);
  const correctedDrawdownYear = Math.max(drawdownYear, correctedDrawdownStart);

  // BUILD GROWTH TABLE
  const growthTable = useMemo(() => {
    const rows = [];
    for (let i = 0; i < period; i++) {
      const baseYearAdjustment = growthAdjustments[i] ?? { equity: equityRate, bonds: bondRate, mmf: mmfRate };
      rows.push({
        year: startYear + i,
        equityRate: baseYearAdjustment.equity,
        bondRate: baseYearAdjustment.bonds,
        mmfRate: baseYearAdjustment.mmf,
        equityAlloc,
        bondAlloc,
        mmfAlloc
      });
    }
    return rows;
  }, [
    startYear,
    period,
    equityRate,
    bondRate,
    mmfRate,
    equityAlloc,
    bondAlloc,
    mmfAlloc,
    growthAdjustments
  ]);

  // BUILD NAV TABLE
  const navRows = useMemo(() => {
    let nav = portfolioValue;
    const rows = [];

    for (let i = 0; i < period; i++) {
      const year = startYear + i;
      const g = growthTable[i];

      const eqRate = g.equityRate / 100;
      const bdRate = g.bondRate / 100;
      const mmfRate = g.mmfRate / 100;

      const eqAlloc = g.equityAlloc / 100;
      const bdAlloc = g.bondAlloc / 100;
      const mmfAlloc = g.mmfAlloc / 100;

      let growth = eqRate * eqAlloc + bdRate * bdAlloc + mmfRate * mmfAlloc;

      let crashApplied = false;
      if (year === correctedCrashYear) {
        nav *= 1 - crashPercent / 100;
        crashApplied = true;
        growth += interestRateChange / 100;
      }

      nav *= 1 + growth;

      let drawdownApplied = false;
      if (year === correctedDrawdownYear && year >= correctedDrawdownStart) {
        const overrideValue = drawdownOverrides[i];
        const normalizedOverride =
          overrideValue === undefined
            ? undefined
            : overrideValue < 0
              ? overrideValue
              : -Math.abs(overrideValue);
        const drawdownValue =
          normalizedOverride === undefined
            ? -drawdownAmount
            : normalizedOverride;
        nav += drawdownValue;
        drawdownApplied = drawdownValue !== 0;
      }

      rows.push({
        year,
        endValue: nav,
        crashApplied,
        drawdownApplied,
        growthRate: growth
      });
    }

    return rows;
  }, [
    startYear,
    period,
    portfolioValue,
    correctedCrashYear,
    crashPercent,
    interestRateChange,
    correctedDrawdownStart,
    correctedDrawdownYear,
    drawdownAmount,
    drawdownOverrides,
    growthTable
  ]);

  return (
    <div className="layout-wrapper">
      <div className="layout-grid">

        <div className="dashboard-box">
          <PortfolioControlsPanel
            portfolio={portfolioValue}
            onPortfolioChange={setPortfolioValue}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>

        <div className="dashboard-box">
          <CrashYearPanel
            startYear={startYear}
            period={period}
            onPeriodChange={setPeriod}
            crashYear={correctedCrashYear}
            onCrashYearChange={setCrashYear}
            crashPercent={crashPercent}
            onCrashPercentChange={setCrashPercent}
            interestRateChange={interestRateChange}
            onInterestRateChange={setInterestRateChange}
            portfolio={portfolioValue}
            onPortfolioChange={setPortfolioValue}
            age={age}
            onAgeChange={setAge}
          />
        </div>

        <div className="dashboard-box">
          <DrawdownPanel
            startYear={startYear}
            drawdownStartYear={correctedDrawdownStart}
            onDrawdownStartYearChange={setDrawdownStartYear}
            drawdownYear={correctedDrawdownYear}
            onDrawdownYearChange={setDrawdownYear}
            drawdownAmount={drawdownAmount}
            onDrawdownAmountChange={setDrawdownAmount}
          />
        </div>

        <div className="dashboard-box">
          <GrowthByYearPanel
            period={period}
            equityRate={equityRate}
            bondRate={bondRate}
            mmfRate={mmfRate}
            resetTrigger={growthRatesResetKey}
            onApplyGrowthRates={() => {
              setGrowthAdjustments([]);
              setGrowthRatesResetKey((value) => value + 1);
            }}
            onApplyGrowthAdjustments={(table) => {
              setGrowthAdjustments(table.map((row) => ({
                year: row.year,
                equity: row.equity,
                bonds: row.bonds,
                mmf: row.mmf
              })));
            }}
          />
        </div>

        <div className="dashboard-box">
          <NavChartPanel navRows={navRows} age={age} />
        </div>

        <div className="dashboard-box">
          <NavPerYearPanel
            navRows={navRows}
            growthTable={growthTable}
            initialPortfolioValue={portfolioValue}
            drawdownStartYear={correctedDrawdownStart}
            drawdownYear={correctedDrawdownYear}
            drawdownAmount={drawdownAmount}
            onApplyDrawdownChanges={setDrawdownOverrides}
          />
        </div>

      </div>
    </div>
  );
}

export default App;
