import { useState, useMemo } from "react";

import PortfolioControlsPanel from "./components/PortfolioControlsPanel";
import CrashYearPanel from "./components/CrashYearPanel";
import DrawdownPanel from "./components/DrawdownPanel";
import GrowthByYearPanel from "./components/GrowthByYearPanel";
import NavPerYearPanel from "./components/NavPerYearPanel";
import NavChartPanel from "./components/NavChartPanel";
import ChatbotPanel from "./components/ChatbotPanel";

import "./components/layout.css";
import "./components/controls.css";

function simulate({
  portfolioValue,
  period,
  startYear,
  growthTable,
  correctedDrawdownStart,
  correctedDrawdownYear,
  drawdownAmount,
  drawdownOverrides,
  correctedCrashYear
}: {
  portfolioValue: number;
  period: number;
  startYear: number;
  growthTable: any[];
  correctedDrawdownStart: number;
  correctedDrawdownYear: number;
  drawdownAmount: number;
  drawdownOverrides: number[];
  correctedCrashYear: number;
}) {
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

    const startValue = nav;
    const eqStartValue = startValue * eqAlloc;
    const bdStartValue = startValue * bdAlloc;
    const mmfStartValue = startValue * mmfAlloc;

    const eqGrowthValue = eqStartValue * eqRate;
    const bdGrowthValue = bdStartValue * bdRate;
    const mmfGrowthValue = mmfStartValue * mmfRate;

    const interimValue = startValue + eqGrowthValue + bdGrowthValue + mmfGrowthValue;

    let drawdownApplied = false;
    let drawdownMagnitude = 0;
    let drawdownValue = 0;
    if (year >= correctedDrawdownYear && year >= correctedDrawdownStart) {
      const overrideValue = drawdownOverrides[i];
      drawdownValue = overrideValue === undefined ? -drawdownAmount : (overrideValue < 0 ? overrideValue : -Math.abs(overrideValue));
      drawdownMagnitude = Math.abs(drawdownValue);
      drawdownApplied = drawdownValue !== 0;
    }

    nav = interimValue + drawdownValue;

    const eqEndValue = eqStartValue + eqGrowthValue - drawdownMagnitude * eqAlloc;
    const bdEndValue = bdStartValue + bdGrowthValue - drawdownMagnitude * bdAlloc;
    const mmfEndValue = mmfStartValue + mmfGrowthValue - drawdownMagnitude * mmfAlloc;

    const crashApplied = year === correctedCrashYear;

    rows.push({
      year,
      endValue: nav,
      crashApplied,
      drawdownApplied,
      growthRate: eqRate * eqAlloc + bdRate * bdAlloc + mmfRate * mmfAlloc,
      eqEndValue,
      bdEndValue,
      mmfEndValue
    });
  }

  return rows;
}

function App() {
  // GLOBAL START YEAR = current year + 1
  const currentYear = new Date().getFullYear();
  const startYear = currentYear + 1;

  // MAIN STATE
  const [portfolioValue, setPortfolioValue] = useState(3500000);
  const [age, setAge] = useState(55);
  const [period, setPeriod] = useState(25);

  // CRASH
  const [crashPercent, setCrashPercent] = useState(45);
  const [interestRateChange, setInterestRateChange] = useState(-2);

  // DRAWDOWN
  const [drawdownStartYear, setDrawdownStartYear] = useState(startYear);
  const [drawdownYearS1, setDrawdownYearS1] = useState(startYear + 1);
  const [drawdownYearS2, setDrawdownYearS2] = useState(startYear + 1);
  const [drawdownAmountS1, setDrawdownAmountS1] = useState(300000);
  const [drawdownAmountS2, setDrawdownAmountS2] = useState(300000);
  const [drawdownOverridesS1, setDrawdownOverridesS1] = useState<number[]>([]);
  const [drawdownOverridesS2, setDrawdownOverridesS2] = useState<number[]>([]);

  // GROWTH + ALLOCATIONS
  const [equityRate, setEquityRate] = useState(8.0);
  const [bondRate, setBondRate] = useState(3.5);
  const [mmfRate, setMmfRate] = useState(1.5);

  const [equityAllocS1, setEquityAllocS1] = useState(10);
  const [bondAllocS1, setBondAllocS1] = useState(20);
  const [mmfAllocS1, setMmfAllocS1] = useState(70);

  const [equityAllocS2, setEquityAllocS2] = useState(50);
  const [bondAllocS2, setBondAllocS2] = useState(40);
  const [mmfAllocS2, setMmfAllocS2] = useState(10);

  const [equityAllocPostCrash, setEquityAllocPostCrash] = useState(70);
  const [bondAllocPostCrash, setBondAllocPostCrash] = useState(20);
  const [mmfAllocPostCrash, setMmfAllocPostCrash] = useState(10);

  const [crashYear, setCrashYear] = useState(startYear + 1);
  const [growthAdjustments, setGrowthAdjustments] = useState<
    Array<{ year: number; equity: number; bonds: number; mmf: number } | undefined>
  >([]);
  const [growthRatesResetKey, setGrowthRatesResetKey] = useState(0);
  const [hasManualGrowthAdjustments, setHasManualGrowthAdjustments] = useState(false);

  // AUTO-CORRECT RULES
  const correctedCrashYear = Math.max(crashYear, startYear);
  const correctedDrawdownStart = Math.max(drawdownStartYear, startYear);
  const correctedDrawdownYearS1 = Math.max(drawdownYearS1, correctedDrawdownStart);
  const correctedDrawdownYearS2 = Math.max(drawdownYearS2, correctedDrawdownStart);

  // CHATBOT STATE
  const [chatbotModal, setChatbotModal] = useState<{
    isOpen: boolean;
    question: string;
    answerS1: string;
    answerS2: string;
    type: "portfolio" | "allocation" | "drawdown" | "unknown";
    valS1: any;
    valS2: any;
  } | null>(null);

  const handleAskChatbot = (q: string) => {
    const normalizedQ = q.toLowerCase();

    if (normalizedQ.includes("portfolio value") || normalizedQ.includes("portfolio need to be")) {
      // Question 1: Required Portfolio Value
      const runCalc = (growthTable: any[], drawdownAmt: number, overrides: number[], corrDrawdownYear: number) => {
        const r1 = simulate({
          portfolioValue: 0,
          period,
          startYear,
          growthTable,
          correctedDrawdownStart,
          correctedDrawdownYearS1,
          drawdownAmount: drawdownAmt,
          drawdownOverrides: overrides,
          correctedCrashYear
        });
        const finalNav1 = r1[r1.length - 1]?.endValue ?? 0;
        const B = -finalNav1;

        const r2 = simulate({
          portfolioValue: 1_000_000,
          period,
          startYear,
          growthTable,
          correctedDrawdownStart,
          correctedDrawdownYearS2,
          drawdownAmount: drawdownAmt,
          drawdownOverrides: overrides,
          correctedCrashYear
        });
        const finalNav2 = r2[r2.length - 1]?.endValue ?? 0;
        const A = (finalNav2 + B) / 1_000_000;

        if (A <= 1) return { possible: false, value: 0 };
        const requiredP = B / (A - 1);
        return { possible: true, value: Math.max(0, requiredP) };
      };

      const resS1 = runCalc(growthTableS1, drawdownAmountS1, drawdownOverridesS1, correctedDrawdownYearS1);
      const resS2 = runCalc(growthTableS2, drawdownAmountS2, drawdownOverridesS2, correctedDrawdownYearS2);

      const answerS1 = resS1.possible
        ? `To maintain your drawdowns without significant NAV loss, Scenario 1 requires an initial portfolio value of ${resS1.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}.`
        : `In Scenario 1, the portfolio growth is too low to sustain drawdowns without NAV loss, regardless of the initial value.`;

      const answerS2 = resS2.possible
        ? `To maintain your drawdowns without significant NAV loss, Scenario 2 requires an initial portfolio value of ${resS2.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}.`
        : `In Scenario 2, the portfolio growth is too low to sustain drawdowns without NAV loss, regardless of the initial value.`;

      setChatbotModal({
        isOpen: true,
        question: q,
        answerS1,
        answerS2,
        type: "portfolio",
        valS1: resS1.possible ? resS1.value : null,
        valS2: resS2.possible ? resS2.value : null
      });
    } else if (normalizedQ.includes("optimum") || normalizedQ.includes("allocation")) {
      // Question 2: Optimum Allocation
      const runCalc = (isS1: boolean) => {
        const allocations = [
          { name: "100% Equities", eq: 100, bd: 0, mmf: 0 },
          { name: "100% Bonds", eq: 0, bd: 100, mmf: 0 },
          { name: "100% MMF", eq: 0, bd: 0, mmf: 100 }
        ];

        let bestAlloc = allocations[0];
        let bestNav = -Infinity;

        const drawdownAmt = isS1 ? drawdownAmountS1 : drawdownAmountS2;
        const overrides = isS1 ? drawdownOverridesS1 : drawdownOverridesS2;
        const corrDrawdownYear = isS1 ? correctedDrawdownYearS1 : correctedDrawdownYearS2;

        allocations.forEach((alloc) => {
          const tempGrowthTable = [];
          for (let i = 0; i < period; i++) {
            const year = startYear + i;
            const baseYearAdjustment = growthAdjustments[i] ?? { equity: equityRate, bonds: bondRate, mmf: mmfRate };
            const isCrashYear = year === correctedCrashYear;
            const resolvedRow = {
              ...baseYearAdjustment,
              equity: isCrashYear ? -Math.abs(crashPercent) : baseYearAdjustment.equity,
              bonds: baseYearAdjustment.bonds,
              mmf: baseYearAdjustment.mmf
            };
            const isPostCrash = year > correctedCrashYear;
            tempGrowthTable.push({
              year,
              equityRate: resolvedRow.equity,
              bondRate: resolvedRow.bonds,
              mmfRate: resolvedRow.mmf,
              equityAlloc: isPostCrash ? equityAllocPostCrash : alloc.eq,
              bondAlloc: isPostCrash ? bondAllocPostCrash : alloc.bd,
              mmfAlloc: isPostCrash ? mmfAllocPostCrash : alloc.mmf
            });
          }

          const r = simulate({
            portfolioValue,
            period,
            startYear,
            growthTable: tempGrowthTable,
            correctedDrawdownStart,
            correctedDrawdownYear: corrDrawdownYear,
            drawdownAmount: drawdownAmt,
            drawdownOverrides: overrides,
            correctedCrashYear
          });
          const finalNav = r[r.length - 1]?.endValue ?? 0;
          if (finalNav > bestNav) {
            bestNav = finalNav;
            bestAlloc = alloc;
          }
        });

        return bestAlloc;
      };

      const resS1 = runCalc(true);
      const resS2 = runCalc(false);

      const answerS1 = `To maximize your end NAV in Scenario 1, the optimum allocation before the crash is ${resS1.name}.`;
      const answerS2 = `To maximize your end NAV in Scenario 2, the optimum allocation before the crash is ${resS2.name}.`;

      setChatbotModal({
        isOpen: true,
        question: q,
        answerS1,
        answerS2,
        type: "allocation",
        valS1: resS1,
        valS2: resS2
      });
    } else if (normalizedQ.includes("drawdown") || normalizedQ.includes("afford")) {
      // Question 3: Affordable Drawdown
      const runCalc = (growthTable: any[], corrDrawdownYear: number) => {
        const r1 = simulate({
          portfolioValue,
          period,
          startYear,
          growthTable,
          correctedDrawdownStart,
          correctedDrawdownYear: corrDrawdownYear,
          drawdownAmount: 0,
          drawdownOverrides: Array(period).fill(undefined),
          correctedCrashYear
        });
        const C = r1[r1.length - 1]?.endValue ?? 0;

        const r2 = simulate({
          portfolioValue,
          period,
          startYear,
          growthTable,
          correctedDrawdownStart,
          correctedDrawdownYear: corrDrawdownYear,
          drawdownAmount: 100_000,
          drawdownOverrides: Array(period).fill(undefined),
          correctedCrashYear
        });
        const finalNav2 = r2[r2.length - 1]?.endValue ?? 0;
        const K = (C - finalNav2) / 100_000;

        if (K <= 0) return { possible: false, value: 0 };
        const affordableD = (C - portfolioValue) / K;
        return { possible: true, value: Math.max(0, affordableD) };
      };

      const resS1 = runCalc(growthTableS1, correctedDrawdownYearS1);
      const resS2 = runCalc(growthTableS2, correctedDrawdownYearS2);

      const answerS1 = resS1.possible
        ? `In Scenario 1, you can afford an annual drawdown of ${resS1.value.toLocaleString("en-US", { maximumFractionDigits: 0 })} each year without NAV loss.`
        : `In Scenario 1, you cannot afford any drawdown without NAV loss.`;

      const answerS2 = resS2.possible
        ? `In Scenario 2, you can afford an annual drawdown of ${resS2.value.toLocaleString("en-US", { maximumFractionDigits: 0 })} each year without NAV loss.`
        : `In Scenario 2, you cannot afford any drawdown without NAV loss.`;

      setChatbotModal({
        isOpen: true,
        question: q,
        answerS1,
        answerS2,
        type: "drawdown",
        valS1: resS1.possible ? resS1.value : null,
        valS2: resS2.possible ? resS2.value : null
      });
    } else {
      // Unknown question
      setChatbotModal({
        isOpen: true,
        question: q,
        answerS1: "I'm sorry, I can only answer questions about required portfolio value, optimum allocation, or affordable drawdowns.",
        answerS2: "Please try asking one of the example questions!",
        type: "unknown",
        valS1: null,
        valS2: null
      });
    }
  };

  const handleApplyChatbot = (action: "cancel" | "all" | "s1" | "s2") => {
    if (action === "cancel" || !chatbotModal) {
      setChatbotModal(null);
      return;
    }

    const { type, valS1, valS2 } = chatbotModal;

    if (type === "portfolio") {
      if (action === "all" && valS1 !== null) {
        setPortfolioValue(valS1);
      } else if (action === "s1" && valS1 !== null) {
        setPortfolioValue(valS1);
      } else if (action === "s2" && valS2 !== null) {
        setPortfolioValue(valS2);
      }
    } else if (type === "allocation") {
      if (action === "all") {
        if (valS1) {
          setEquityAllocS1(valS1.eq);
          setBondAllocS1(valS1.bd);
          setMmfAllocS1(valS1.mmf);
        }
        if (valS2) {
          setEquityAllocS2(valS2.eq);
          setBondAllocS2(valS2.bd);
          setMmfAllocS2(valS2.mmf);
        }
      } else if (action === "s1" && valS1) {
        setEquityAllocS1(valS1.eq);
        setBondAllocS1(valS1.bd);
        setMmfAllocS1(valS1.mmf);
      } else if (action === "s2" && valS2) {
        setEquityAllocS2(valS2.eq);
        setBondAllocS2(valS2.bd);
        setMmfAllocS2(valS2.mmf);
      }
    } else if (type === "drawdown") {
      if (action === "all") {
        if (valS1 !== null) {
          setDrawdownAmountS1(valS1);
          setDrawdownOverridesS1([]);
        }
        if (valS2 !== null) {
          setDrawdownAmountS2(valS2);
          setDrawdownOverridesS2([]);
        }
      } else if (action === "s1" && valS1 !== null) {
        setDrawdownAmountS1(valS1);
        setDrawdownOverridesS1([]);
      } else if (action === "s2" && valS2 !== null) {
        setDrawdownAmountS2(valS2);
        setDrawdownOverridesS2([]);
      }
    }

    setChatbotModal(null);
  };

  const handleRevertToDefaults = () => {
    const confirmed = window.confirm("Are you sure you want to revert all settings to their default values?");
    if (!confirmed) return;

    setPortfolioValue(3500000);
    setAge(55);
    setPeriod(25);
    setCrashPercent(45);
    setInterestRateChange(-2);
    setDrawdownStartYear(startYear);
    setDrawdownYearS1(startYear + 1);
    setDrawdownYearS2(startYear + 1);
    setDrawdownAmountS1(300000);
    setDrawdownAmountS2(300000);
    setDrawdownOverridesS1([]);
    setDrawdownOverridesS2([]);
    setEquityRate(8.0);
    setBondRate(3.5);
    setMmfRate(1.5);
    setEquityAllocS1(10);
    setBondAllocS1(20);
    setMmfAllocS1(70);
    setEquityAllocS2(50);
    setBondAllocS2(40);
    setMmfAllocS2(10);
    setEquityAllocPostCrash(70);
    setBondAllocPostCrash(20);
    setMmfAllocPostCrash(10);
    setCrashYear(startYear + 1);
    setGrowthAdjustments([]);
    setHasManualGrowthAdjustments(false);
    setGrowthRatesResetKey((value) => value + 1);
  };

  // BUILD GROWTH TABLE S1
  const growthTableS1 = useMemo(() => {
    const rows = [];
    for (let i = 0; i < period; i++) {
      const year = startYear + i;
      const baseYearAdjustment = growthAdjustments[i] ?? { equity: equityRate, bonds: bondRate, mmf: mmfRate };
      const isCrashYear = year === correctedCrashYear;
      const resolvedRow = {
        ...baseYearAdjustment,
        equity: isCrashYear ? -Math.abs(crashPercent) : baseYearAdjustment.equity,
        bonds: baseYearAdjustment.bonds,
        mmf: baseYearAdjustment.mmf
      };
      const isPostCrash = year > correctedCrashYear;
      rows.push({
        year,
        equityRate: resolvedRow.equity,
        bondRate: resolvedRow.bonds,
        mmfRate: resolvedRow.mmf,
        equityAlloc: isPostCrash ? equityAllocPostCrash : equityAllocS1,
        bondAlloc: isPostCrash ? bondAllocPostCrash : bondAllocS1,
        mmfAlloc: isPostCrash ? mmfAllocPostCrash : mmfAllocS1
      });
    }
    return rows;
  }, [
    startYear,
    period,
    equityRate,
    bondRate,
    mmfRate,
    equityAllocS1,
    bondAllocS1,
    mmfAllocS1,
    equityAllocPostCrash,
    bondAllocPostCrash,
    mmfAllocPostCrash,
    growthAdjustments,
    correctedCrashYear,
    crashPercent
  ]);

  // BUILD GROWTH TABLE S2
  const growthTableS2 = useMemo(() => {
    const rows = [];
    for (let i = 0; i < period; i++) {
      const year = startYear + i;
      const baseYearAdjustment = growthAdjustments[i] ?? { equity: equityRate, bonds: bondRate, mmf: mmfRate };
      const isCrashYear = year === correctedCrashYear;
      const resolvedRow = {
        ...baseYearAdjustment,
        equity: isCrashYear ? -Math.abs(crashPercent) : baseYearAdjustment.equity,
        bonds: baseYearAdjustment.bonds,
        mmf: baseYearAdjustment.mmf
      };
      const isPostCrash = year > correctedCrashYear;
      rows.push({
        year,
        equityRate: resolvedRow.equity,
        bondRate: resolvedRow.bonds,
        mmfRate: resolvedRow.mmf,
        equityAlloc: isPostCrash ? equityAllocPostCrash : equityAllocS2,
        bondAlloc: isPostCrash ? bondAllocPostCrash : bondAllocS2,
        mmfAlloc: isPostCrash ? mmfAllocPostCrash : mmfAllocS2
      });
    }
    return rows;
  }, [
    startYear,
    period,
    equityRate,
    bondRate,
    mmfRate,
    equityAllocS2,
    bondAllocS2,
    mmfAllocS2,
    equityAllocPostCrash,
    bondAllocPostCrash,
    mmfAllocPostCrash,
    growthAdjustments,
    correctedCrashYear,
    crashPercent
  ]);

  // BUILD NAV TABLE S1
  const navRowsS1 = useMemo(() => {
    let nav = portfolioValue;
    const rows = [];

    for (let i = 0; i < period; i++) {
      const year = startYear + i;
      const g = growthTableS1[i];

      const eqRate = g.equityRate / 100;
      const bdRate = g.bondRate / 100;
      const mmfRate = g.mmfRate / 100;

      const eqAlloc = g.equityAlloc / 100;
      const bdAlloc = g.bondAlloc / 100;
      const mmfAlloc = g.mmfAlloc / 100;

      const startValue = nav;
      const eqStartValue = startValue * eqAlloc;
      const bdStartValue = startValue * bdAlloc;
      const mmfStartValue = startValue * mmfAlloc;

      const eqGrowthValue = eqStartValue * eqRate;
      const bdGrowthValue = bdStartValue * bdRate;
      const mmfGrowthValue = mmfStartValue * mmfRate;

      const interimValue = startValue + eqGrowthValue + bdGrowthValue + mmfGrowthValue;

      let drawdownApplied = false;
      let drawdownMagnitude = 0;
      let drawdownValue = 0;
      if (year >= correctedDrawdownYearS1 && year >= correctedDrawdownStart) {
        const overrideValue = drawdownOverridesS1[i];
        drawdownValue = overrideValue === undefined ? -drawdownAmountS1 : (overrideValue < 0 ? overrideValue : -Math.abs(overrideValue));
        drawdownMagnitude = Math.abs(drawdownValue);
        drawdownApplied = drawdownValue !== 0;
      }

      nav = interimValue + drawdownValue;

      const eqEndValue = eqStartValue + eqGrowthValue - drawdownMagnitude * eqAlloc;
      const bdEndValue = bdStartValue + bdGrowthValue - drawdownMagnitude * bdAlloc;
      const mmfEndValue = mmfStartValue + mmfGrowthValue - drawdownMagnitude * mmfAlloc;

      const crashApplied = year === correctedCrashYear;

      rows.push({
        year,
        endValue: nav,
        crashApplied,
        drawdownApplied,
        growthRate: eqRate * eqAlloc + bdRate * bdAlloc + mmfRate * mmfAlloc,
        eqEndValue,
        bdEndValue,
        mmfEndValue
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
    correctedDrawdownYearS1,
    drawdownAmountS1,
    drawdownOverridesS1,
    growthTableS1
  ]);

  // BUILD NAV TABLE S2
  const navRowsS2 = useMemo(() => {
    let nav = portfolioValue;
    const rows = [];

    for (let i = 0; i < period; i++) {
      const year = startYear + i;
      const g = growthTableS2[i];

      const eqRate = g.equityRate / 100;
      const bdRate = g.bondRate / 100;
      const mmfRate = g.mmfRate / 100;

      const eqAlloc = g.equityAlloc / 100;
      const bdAlloc = g.bondAlloc / 100;
      const mmfAlloc = g.mmfAlloc / 100;

      const startValue = nav;
      const eqStartValue = startValue * eqAlloc;
      const bdStartValue = startValue * bdAlloc;
      const mmfStartValue = startValue * mmfAlloc;

      const eqGrowthValue = eqStartValue * eqRate;
      const bdGrowthValue = bdStartValue * bdRate;
      const mmfGrowthValue = mmfStartValue * mmfRate;

      const interimValue = startValue + eqGrowthValue + bdGrowthValue + mmfGrowthValue;

      let drawdownApplied = false;
      let drawdownMagnitude = 0;
      let drawdownValue = 0;
      if (year >= correctedDrawdownYearS2 && year >= correctedDrawdownStart) {
        const overrideValue = drawdownOverridesS2[i];
        drawdownValue = overrideValue === undefined ? -drawdownAmountS2 : (overrideValue < 0 ? overrideValue : -Math.abs(overrideValue));
        drawdownMagnitude = Math.abs(drawdownValue);
        drawdownApplied = drawdownValue !== 0;
      }

      nav = interimValue + drawdownValue;

      const eqEndValue = eqStartValue + eqGrowthValue - drawdownMagnitude * eqAlloc;
      const bdEndValue = bdStartValue + bdGrowthValue - drawdownMagnitude * bdAlloc;
      const mmfEndValue = mmfStartValue + mmfGrowthValue - drawdownMagnitude * mmfAlloc;

      const crashApplied = year === correctedCrashYear;

      rows.push({
        year,
        endValue: nav,
        crashApplied,
        drawdownApplied,
        growthRate: eqRate * eqAlloc + bdRate * bdAlloc + mmfRate * mmfAlloc,
        eqEndValue,
        bdEndValue,
        mmfEndValue
      });
    }

    return rows;
  }, [
    startYear,
    period,
    portfolioValue,
    correctedCrashYear,
    correctedDrawdownStart,
    correctedDrawdownYearS2,
    drawdownAmountS2,
    drawdownOverridesS2,
    growthTableS2
  ]);

  const handleCrashYearChange = (nextYear: number) => {
    if (hasManualGrowthAdjustments && nextYear !== crashYear) {
      const shouldReset = window.confirm(
        "Reset growth rates and discard manual growth adjustments? Click OK to reset, Cancel to shift the crash-year override."
      );

      if (shouldReset) {
        setGrowthAdjustments([]);
        setHasManualGrowthAdjustments(false);
        setGrowthRatesResetKey((value) => value + 1);
      } else {
        const delta = nextYear - crashYear;
        const shifted = Array.from({ length: period }, (_, index) => {
          const sourceIndex = index - delta;
          if (sourceIndex < 0 || sourceIndex >= growthAdjustments.length) {
            return undefined;
          }
          return growthAdjustments[sourceIndex];
        });
        setGrowthAdjustments(shifted);
      }
    }

    setCrashYear(nextYear);
  };

  const handleApplyGrowthRates = () => {
    setGrowthAdjustments([]);
    setHasManualGrowthAdjustments(false);
    setGrowthRatesResetKey((value) => value + 1);
  };

  const handleApplyGrowthAdjustments = (table: Array<{ year: number; equity: number; bonds: number; mmf: number }>) => {
    setGrowthAdjustments(table.map((row) => ({
      year: row.year,
      equity: row.equity,
      bonds: row.bonds,
      mmf: row.mmf
    })));
    setHasManualGrowthAdjustments(true);
  };

  return (
    <div className="layout-wrapper">
      <div className="layout-grid">

        {/* COLUMN 1: CONTROLS */}
        <div className="layout-column controls-column">
          <div className="dashboard-box">
            <ChatbotPanel onAsk={handleAskChatbot} onRevertToDefaults={handleRevertToDefaults} />
          </div>

          <div className="dashboard-box">
            <PortfolioControlsPanel
              portfolio={portfolioValue}
              crashYear={correctedCrashYear}
              onApply={(settings) => {
                setEquityRate(settings.equity);
                setBondRate(settings.bonds);
                setMmfRate(settings.mmf);
                setEquityAllocS1(settings.equityAllocS1);
                setBondAllocS1(settings.bondAllocS1);
                setMmfAllocS1(settings.mmfAllocS1);
                setEquityAllocS2(settings.equityAllocS2);
                setBondAllocS2(settings.bondAllocS2);
                setMmfAllocS2(settings.mmfAllocS2);
                setEquityAllocPostCrash(settings.equityAllocPostCrash);
                setBondAllocPostCrash(settings.bondAllocPostCrash);
                setMmfAllocPostCrash(settings.mmfAllocPostCrash);
                setGrowthAdjustments([]);
                setGrowthRatesResetKey((value) => value + 1);
              }}
            />
          </div>

          <div className="dashboard-box">
            <GrowthByYearPanel
              startYear={startYear}
              period={period}
              crashYear={correctedCrashYear}
              crashPercent={crashPercent}
              equityRate={equityRate}
              bondRate={bondRate}
              mmfRate={mmfRate}
              resetTrigger={growthRatesResetKey}
              onApplyGrowthRates={handleApplyGrowthRates}
              onApplyGrowthAdjustments={handleApplyGrowthAdjustments}
            />
          </div>
        </div>

        {/* COLUMN 2: CHARTS */}
        <div className="layout-column">
          <div className="dashboard-box">
            <CrashYearPanel
              startYear={startYear}
              period={period}
              onPeriodChange={setPeriod}
              crashYear={correctedCrashYear}
              onCrashYearChange={handleCrashYearChange}
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
          <div className="dashboard-box" style={{ flex: 1 }}>
            <NavChartPanel title="Scenario 1 NAV Chart" navRows={navRowsS1} age={age} />
          </div>
          <div className="dashboard-box" style={{ flex: 1 }}>
            <NavChartPanel title="Scenario 2 NAV Chart" navRows={navRowsS2} age={age} />
          </div>
        </div>

        {/* COLUMN 3: TABLES */}
        <div className="layout-column">
          <div className="dashboard-box">
            <DrawdownPanel
              drawdownStartYear={correctedDrawdownStart}
              onDrawdownStartYearChange={setDrawdownStartYear}
              drawdownYearS1={correctedDrawdownYearS1}
              onDrawdownYearS1Change={setDrawdownYearS1}
              drawdownYearS2={correctedDrawdownYearS2}
              onDrawdownYearS2Change={setDrawdownYearS2}
              drawdownAmountS1={drawdownAmountS1}
              onDrawdownAmountS1Change={setDrawdownAmountS1}
              drawdownAmountS2={drawdownAmountS2}
              onDrawdownAmountS2Change={setDrawdownAmountS2}
              onApply={() => {
                setDrawdownOverridesS1([]);
                setDrawdownOverridesS2([]);
              }}
            />
          </div>
          <div className="dashboard-box" style={{ flex: 1 }}>
            <NavPerYearPanel
              title="Scenario 1 NAV per Year"
              navRows={navRowsS1}
              growthTable={growthTableS1}
              initialPortfolioValue={portfolioValue}
              drawdownStartYear={correctedDrawdownStart}
              drawdownYear={correctedDrawdownYearS1}
              drawdownAmount={drawdownAmountS1}
              onApplyDrawdownChanges={setDrawdownOverridesS1}
            />
          </div>
          <div className="dashboard-box" style={{ flex: 1 }}>
            <NavPerYearPanel
              title="Scenario 2 NAV per Year"
              navRows={navRowsS2}
              growthTable={growthTableS2}
              initialPortfolioValue={portfolioValue}
              drawdownStartYear={correctedDrawdownStart}
              drawdownYear={correctedDrawdownYearS2}
              drawdownAmount={drawdownAmountS2}
              onApplyDrawdownChanges={setDrawdownOverridesS2}
            />
          </div>
        </div>

      </div>

      {/* CHATBOT MODAL POPUP */}
      {chatbotModal?.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px", fontWeight: 600 }}>
              Chatbot Answer
            </h3>
            <p style={{ fontSize: "14px", color: "#4b5563", fontStyle: "italic", marginBottom: "16px" }}>
              "{chatbotModal.question}"
            </p>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 600, color: "#1e3a8a" }}>
                Scenario 1
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#1f2937", lineHeight: "1.5" }}>
                {chatbotModal.answerS1}
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 600, color: "#1e3a8a" }}>
                Scenario 2
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#1f2937", lineHeight: "1.5" }}>
                {chatbotModal.answerS2}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => handleApplyChatbot("cancel")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
              {chatbotModal.type !== "unknown" && (
                <>
                  <button
                    onClick={() => handleApplyChatbot("s1")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Apply Scenario 1
                  </button>
                  <button
                    onClick={() => handleApplyChatbot("s2")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#10b981",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Apply Scenario 2
                  </button>
                  <button
                    onClick={() => handleApplyChatbot("all")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#4f46e5",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Apply All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
