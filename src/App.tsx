import { useEffect, useMemo, useState } from "react";

import PortfolioControlsPanel from "./components/PortfolioControlsPanel";
import CrashYearPanel from "./components/CrashYearPanel";
import DrawdownPanel from "./components/DrawdownPanel";
import GrowthByYearPanel from "./components/GrowthByYearPanel";
import NavPerYearPanel from "./components/NavPerYearPanel";
import NavChartPanel from "./components/NavChartPanel";
import ChatbotPanel from "./components/ChatbotPanel";

import "./components/layout.css";
import "./components/controls.css";

type SimulationGrowthRow = {
  year: number;
  equityRate: number;
  bondRate: number;
  mmfRate: number;
  equityAlloc: number;
  bondAlloc: number;
  mmfAlloc: number;
};

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
  growthTable: SimulationGrowthRow[];
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

type GrowthAdjustment = { year: number; equity: number; bonds: number; mmf: number } | undefined;

type ScenarioSnapshot = {
  portfolioValueS1: number;
  portfolioValueS2: number;
  age: number;
  period: number;
  crashPercentS1: number;
  crashPercentS2: number;
  interestRateChangeS1: number;
  interestRateChangeS2: number;
  applyGrowthToBothScenarios: boolean;
  growthEditorScenario: "s1" | "s2";
  drawdownStartYear: number;
  drawdownYearS1: number;
  drawdownYearS2: number;
  drawdownAmountS1: number;
  drawdownAmountS2: number;
  drawdownOverridesS1: number[];
  drawdownOverridesS2: number[];
  equityRateS1: number;
  bondRateS1: number;
  mmfRateS1: number;
  equityRateS2: number;
  bondRateS2: number;
  mmfRateS2: number;
  equityAllocS1: number;
  bondAllocS1: number;
  mmfAllocS1: number;
  equityAllocS2: number;
  bondAllocS2: number;
  mmfAllocS2: number;
  equityAllocPostCrashS1: number;
  bondAllocPostCrashS1: number;
  mmfAllocPostCrashS1: number;
  equityAllocPostCrashS2: number;
  bondAllocPostCrashS2: number;
  mmfAllocPostCrashS2: number;
  crashYearS1: number;
  crashYearS2: number;
  growthAdjustmentsS1: GrowthAdjustment[];
  growthAdjustmentsS2: GrowthAdjustment[];
  hasManualGrowthAdjustmentsS1: boolean;
  hasManualGrowthAdjustmentsS2: boolean;
};

type SavedScenario = {
  name: string;
  createdAt: string;
  settings: ScenarioSnapshot;
};

type UserProfile = {
  name: string;
  age: number;
  scenarioNameBase: string;
  savedScenarios: SavedScenario[];
};

const USER_PROFILES_KEY = "portfolio-model.user-profiles";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function App() {
  // GLOBAL START YEAR = current year + 1
  const currentYear = new Date().getFullYear();
  const startYear = currentYear + 1;

  // MAIN STATE
  const [portfolioValueS1, setPortfolioValueS1] = useState(3500000);
  const [portfolioValueS2, setPortfolioValueS2] = useState(3500000);
  const [age, setAge] = useState(55);
  const [period, setPeriod] = useState(25);

  // SCENARIO-SPECIFIC GROWTH SHOCK SETTINGS
  const [crashPercentS1, setCrashPercentS1] = useState(45);
  const [crashPercentS2, setCrashPercentS2] = useState(45);
  const [interestRateChangeS1, setInterestRateChangeS1] = useState(-2);
  const [interestRateChangeS2, setInterestRateChangeS2] = useState(-2);
  const [applyGrowthToBothScenarios, setApplyGrowthToBothScenarios] = useState(true);
  const [growthEditorScenario, setGrowthEditorScenario] = useState<"s1" | "s2">("s1");

  // DRAWDOWN
  const [drawdownStartYear, setDrawdownStartYear] = useState(startYear);
  const [drawdownYearS1, setDrawdownYearS1] = useState(startYear + 1);
  const [drawdownYearS2, setDrawdownYearS2] = useState(startYear + 1);
  const [drawdownAmountS1, setDrawdownAmountS1] = useState(300000);
  const [drawdownAmountS2, setDrawdownAmountS2] = useState(300000);
  const [drawdownOverridesS1, setDrawdownOverridesS1] = useState<number[]>([]);
  const [drawdownOverridesS2, setDrawdownOverridesS2] = useState<number[]>([]);

  // GROWTH + ALLOCATIONS
  const [equityRateS1, setEquityRateS1] = useState(8.0);
  const [bondRateS1, setBondRateS1] = useState(3.5);
  const [mmfRateS1, setMmfRateS1] = useState(1.5);
  const [equityRateS2, setEquityRateS2] = useState(8.0);
  const [bondRateS2, setBondRateS2] = useState(3.5);
  const [mmfRateS2, setMmfRateS2] = useState(1.5);

  const [equityAllocS1, setEquityAllocS1] = useState(10);
  const [bondAllocS1, setBondAllocS1] = useState(20);
  const [mmfAllocS1, setMmfAllocS1] = useState(70);

  const [equityAllocS2, setEquityAllocS2] = useState(50);
  const [bondAllocS2, setBondAllocS2] = useState(40);
  const [mmfAllocS2, setMmfAllocS2] = useState(10);

  const [equityAllocPostCrashS1, setEquityAllocPostCrashS1] = useState(70);
  const [bondAllocPostCrashS1, setBondAllocPostCrashS1] = useState(20);
  const [mmfAllocPostCrashS1, setMmfAllocPostCrashS1] = useState(10);

  const [equityAllocPostCrashS2, setEquityAllocPostCrashS2] = useState(70);
  const [bondAllocPostCrashS2, setBondAllocPostCrashS2] = useState(20);
  const [mmfAllocPostCrashS2, setMmfAllocPostCrashS2] = useState(10);

  const [crashYearS1, setCrashYearS1] = useState(startYear + 1);
  const [crashYearS2, setCrashYearS2] = useState(startYear + 1);
  const [growthAdjustmentsS1, setGrowthAdjustmentsS1] = useState<GrowthAdjustment[]>([]);
  const [growthAdjustmentsS2, setGrowthAdjustmentsS2] = useState<GrowthAdjustment[]>([]);
  const [growthRatesResetKeyS1, setGrowthRatesResetKeyS1] = useState(0);
  const [growthRatesResetKeyS2, setGrowthRatesResetKeyS2] = useState(0);
  const [hasManualGrowthAdjustmentsS1, setHasManualGrowthAdjustmentsS1] = useState(false);
  const [hasManualGrowthAdjustmentsS2, setHasManualGrowthAdjustmentsS2] = useState(false);

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [currentUserName, setCurrentUserName] = useState("");
  const [userPromptMode, setUserPromptMode] = useState<"existing" | "new">("existing");
  const [selectedExistingUser, setSelectedExistingUser] = useState("");
  const [newUserName, setNewUserName] = useState("");

  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [selectedSavedScenario, setSelectedSavedScenario] = useState("");
  const [scenarioNameBase, setScenarioNameBase] = useState("Scenario");

  // AUTO-CORRECT RULES
  const correctedCrashYearS1 = Math.max(crashYearS1, startYear);
  const correctedCrashYearS2 = Math.max(crashYearS2, startYear);
  const correctedDrawdownStart = Math.max(drawdownStartYear, startYear);
  const correctedDrawdownYearS1 = Math.max(drawdownYearS1, correctedDrawdownStart);
  const correctedDrawdownYearS2 = Math.max(drawdownYearS2, correctedDrawdownStart);

  useEffect(() => {
    try {
      const rawValue = localStorage.getItem(USER_PROFILES_KEY);
      if (!rawValue) {
        setUserPromptMode("new");
        return;
      }
      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) {
        const loadedProfiles = parsed as UserProfile[];
        setUserProfiles(loadedProfiles);
        if (loadedProfiles.length > 0) {
          setSelectedExistingUser(loadedProfiles[0].name);
          setUserPromptMode("existing");
        } else {
          setUserPromptMode("new");
        }
      }
    } catch {
      setUserProfiles([]);
      setUserPromptMode("new");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(userProfiles));
  }, [userProfiles]);

  useEffect(() => {
    if (!currentUserName) return;
    setUserProfiles((current) => {
      const index = current.findIndex((profile) => profile.name === currentUserName);
      if (index < 0) return current;

      const updated = [...current];
      updated[index] = {
        ...updated[index],
        age,
        scenarioNameBase,
        savedScenarios
      };
      return updated;
    });
  }, [currentUserName, age, scenarioNameBase, savedScenarios]);

  useEffect(() => {
    if (applyGrowthToBothScenarios && correctedCrashYearS1 !== correctedCrashYearS2) {
      setApplyGrowthToBothScenarios(false);
    }
  }, [applyGrowthToBothScenarios, correctedCrashYearS1, correctedCrashYearS2]);

  const activeCrashPercent = growthEditorScenario === "s1" ? crashPercentS1 : crashPercentS2;
  const activeInterestRateChange = growthEditorScenario === "s1" ? interestRateChangeS1 : interestRateChangeS2;
  const activeCrashYear = growthEditorScenario === "s1" ? correctedCrashYearS1 : correctedCrashYearS2;
  const activeEquityRate = growthEditorScenario === "s1" ? equityRateS1 : equityRateS2;
  const activeBondRate = growthEditorScenario === "s1" ? bondRateS1 : bondRateS2;
  const activeMmfRate = growthEditorScenario === "s1" ? mmfRateS1 : mmfRateS2;
  const activeGrowthAdjustments = growthEditorScenario === "s1" ? growthAdjustmentsS1 : growthAdjustmentsS2;
  const activeGrowthResetKey = growthEditorScenario === "s1" ? growthRatesResetKeyS1 : growthRatesResetKeyS2;

  const setGrowthRatesForEditor = (rates: { equity: number; bonds: number; mmf: number }) => {
    if (applyGrowthToBothScenarios) {
      setEquityRateS1(rates.equity);
      setBondRateS1(rates.bonds);
      setMmfRateS1(rates.mmf);
      setEquityRateS2(rates.equity);
      setBondRateS2(rates.bonds);
      setMmfRateS2(rates.mmf);
      return;
    }

    if (growthEditorScenario === "s1") {
      setEquityRateS1(rates.equity);
      setBondRateS1(rates.bonds);
      setMmfRateS1(rates.mmf);
    } else {
      setEquityRateS2(rates.equity);
      setBondRateS2(rates.bonds);
      setMmfRateS2(rates.mmf);
    }
  };

  const setCrashPercentForEditor = (value: number) => {
    if (applyGrowthToBothScenarios) {
      setCrashPercentS1(value);
      setCrashPercentS2(value);
      return;
    }
    if (growthEditorScenario === "s1") {
      setCrashPercentS1(value);
    } else {
      setCrashPercentS2(value);
    }
  };

  const setInterestRateChangeForEditor = (value: number) => {
    if (applyGrowthToBothScenarios) {
      setInterestRateChangeS1(value);
      setInterestRateChangeS2(value);
      return;
    }
    if (growthEditorScenario === "s1") {
      setInterestRateChangeS1(value);
    } else {
      setInterestRateChangeS2(value);
    }
  };

  const setGrowthAdjustmentsForEditor = (rows: GrowthAdjustment[], hasManual: boolean) => {
    if (applyGrowthToBothScenarios) {
      setGrowthAdjustmentsS1(rows);
      setGrowthAdjustmentsS2(rows);
      setHasManualGrowthAdjustmentsS1(hasManual);
      setHasManualGrowthAdjustmentsS2(hasManual);
      setGrowthRatesResetKeyS1((value) => value + 1);
      setGrowthRatesResetKeyS2((value) => value + 1);
      return;
    }

    if (growthEditorScenario === "s1") {
      setGrowthAdjustmentsS1(rows);
      setHasManualGrowthAdjustmentsS1(hasManual);
      setGrowthRatesResetKeyS1((value) => value + 1);
    } else {
      setGrowthAdjustmentsS2(rows);
      setHasManualGrowthAdjustmentsS2(hasManual);
      setGrowthRatesResetKeyS2((value) => value + 1);
    }
  };

  const handleApplyToBothScenariosChange = (checked: boolean) => {
    if (!checked) {
      setApplyGrowthToBothScenarios(false);
      return;
    }

    if (applyGrowthToBothScenarios) {
      setApplyGrowthToBothScenarios(true);
      return;
    }

    const keepChoice = window.prompt(
      "Choose which scenario settings to keep when re-enabling Apply to both. Type 1 for Scenario 1, 2 for Scenario 2, or Cancel to keep separate settings.",
      "1"
    );

    if (keepChoice === null) {
      return;
    }

    const keepScenario = keepChoice.trim() === "2" ? "s2" : keepChoice.trim() === "1" ? "s1" : null;
    if (!keepScenario) {
      return;
    }

    if (keepScenario === "s1") {
      setEquityRateS2(equityRateS1);
      setBondRateS2(bondRateS1);
      setMmfRateS2(mmfRateS1);
      setCrashPercentS2(crashPercentS1);
      setInterestRateChangeS2(interestRateChangeS1);
      setCrashYearS2(crashYearS1);
      setGrowthAdjustmentsS2(growthAdjustmentsS1);
      setHasManualGrowthAdjustmentsS2(hasManualGrowthAdjustmentsS1);
      setGrowthRatesResetKeyS2((value) => value + 1);
      setGrowthEditorScenario("s1");
    } else {
      setEquityRateS1(equityRateS2);
      setBondRateS1(bondRateS2);
      setMmfRateS1(mmfRateS2);
      setCrashPercentS1(crashPercentS2);
      setInterestRateChangeS1(interestRateChangeS2);
      setCrashYearS1(crashYearS2);
      setGrowthAdjustmentsS1(growthAdjustmentsS2);
      setHasManualGrowthAdjustmentsS1(hasManualGrowthAdjustmentsS2);
      setGrowthRatesResetKeyS1((value) => value + 1);
      setGrowthEditorScenario("s2");
    }

    setApplyGrowthToBothScenarios(true);
  };

  // CHATBOT STATE
  const [chatbotModal, setChatbotModal] = useState<{
    isOpen: boolean;
    question: string;
    answerS1: string;
    answerS2: string;
    type: "portfolio" | "allocation" | "drawdown" | "growth" | "timing" | "unknown";
    valS1: any;
    valS2: any;
  } | null>(null);

  type ChatIntent = "portfolio" | "allocation" | "drawdown" | "growth" | "timing";

  const detectChatIntent = (question: string): {
    intent: ChatIntent | "unknown";
    confidence: number;
    suggestions: ChatIntent[];
  } => {
    const text = question.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

    const has = (pattern: RegExp) => pattern.test(text);

    const hasGrowthWord = has(/\b(growth|return|returns|rate|yield|performance)\b/);
    const hasNavWord = has(/\b(nav|portfolio value|principal|capital|end nav|final nav)\b/);
    const hasMaintainWord = has(/\b(maintain|keep|preserve|sustain|protect|avoid losing|without loss)\b/);
    const hasPortfolioWord = has(/\b(portfolio|initial|starting portfolio|starting value|initial value|starting capital|initial capital)\b/);
    const hasNeedWord = has(/\b(need|required|require|must|target|how much|what should|have to)\b/);
    const hasAllocationWord = has(/\b(allocation|allocate|mix|weights?|split|equity|bond|mmf)\b/);
    const hasOptimizeWord = has(/\b(optimum|optimal|best|maximi[sz]e|max)\b/);
    const hasDrawdownWord = has(/\b(drawdown|withdraw|withdrawal|spend|income|take out|afford)\b/);
    const hasPreCrashWord = has(/\b(before crash|pre crash|precrash)\b/);
    const hasTimingCue = has(/\b(when|what year|which year|how early|how late|start|begin)\b/);

    const scores: Record<ChatIntent, number> = {
      growth: 0,
      portfolio: 0,
      allocation: 0,
      drawdown: 0,
      timing: 0
    };

    if (hasGrowthWord) scores.growth += 3;
    if (hasGrowthWord && hasMaintainWord) scores.growth += 2;
    if (hasGrowthWord && hasNavWord) scores.growth += 1;

    if (hasPortfolioWord) scores.portfolio += 2;
    if (hasNeedWord) scores.portfolio += 2;
    if (hasDrawdownWord || hasMaintainWord || hasNavWord) scores.portfolio += 1;
    if (has(/\b(portfolio value need to be|portfolio need to be|required portfolio)\b/)) scores.portfolio += 3;

    if (hasAllocationWord) scores.allocation += 2;
    if (hasOptimizeWord) scores.allocation += 2;
    if (hasPreCrashWord) scores.allocation += 2;
    if (hasNavWord) scores.allocation += 1;

    if (hasDrawdownWord) scores.drawdown += 2;
    if (has(/\b(afford|how much|can i|without nav loss|maintain nav)\b/)) scores.drawdown += 2;
    if (!hasPortfolioWord && hasDrawdownWord) scores.drawdown += 1;

    if (hasDrawdownWord) scores.timing += 2;
    if (hasTimingCue) scores.timing += 3;
    if (hasMaintainWord || hasNavWord) scores.timing += 1;

    // If the user asks a time-related drawdown question, prefer timing intent.
    if (hasDrawdownWord && hasTimingCue) {
      scores.timing += 2;
      scores.drawdown = Math.max(0, scores.drawdown - 1);
    }

    // Guardrails so one intent doesn't hijack unrelated questions.
    if (!hasGrowthWord) {
      scores.growth = 0;
    }
    if (!hasAllocationWord) {
      scores.allocation = Math.max(0, scores.allocation - 2);
    }
    if (!hasDrawdownWord) {
      scores.drawdown = Math.max(0, scores.drawdown - 1);
      scores.timing = 0;
    }

    const ranked = (Object.entries(scores) as Array<[ChatIntent, number]>).sort((a, b) => b[1] - a[1]);
    const bestIntent = ranked[0][0];
    const bestScore = ranked[0][1];
    const secondScore = ranked[1][1];

    if (bestScore < 3 || bestScore - secondScore < 2) {
      return {
        intent: "unknown",
        confidence: 0,
        suggestions: ranked.filter(([, score]) => score > 0).slice(0, 2).map(([intent]) => intent)
      };
    }

    const confidence = Math.max(0.5, Math.min(0.99, (bestScore - secondScore + 2) / 6));
    return {
      intent: bestIntent,
      confidence,
      suggestions: ranked.filter(([intent]) => intent !== bestIntent).slice(0, 2).map(([intent]) => intent)
    };
  };

  const handleAskChatbot = (q: string) => {
    const { intent, confidence, suggestions } = detectChatIntent(q);

    if (intent === "growth") {
      // Question 0: Required Growth To Maintain NAV
      const runCalc = (
        growthTable: any[],
        drawdownAmt: number,
        overrides: number[],
        corrDrawdownYear: number,
        scenarioPortfolioValue: number,
        scenarioCrashYear: number
      ) => {
        const calcFinalNav = (growthShift: number) => {
          const shiftedGrowthTable = growthTable.map((row) => ({
            ...row,
            equityRate: row.equityRate + growthShift,
            bondRate: row.bondRate + growthShift,
            mmfRate: row.mmfRate + growthShift
          }));

          const result = simulate({
            portfolioValue: scenarioPortfolioValue,
            period,
            startYear,
            growthTable: shiftedGrowthTable,
            correctedDrawdownStart,
            correctedDrawdownYear: corrDrawdownYear,
            drawdownAmount: drawdownAmt,
            drawdownOverrides: overrides,
            correctedCrashYear: scenarioCrashYear
          });

          return result[result.length - 1]?.endValue ?? 0;
        };

        const targetNav = scenarioPortfolioValue;
        const currentFinalNav = calcFinalNav(0);

        if (currentFinalNav >= targetNav) {
          return { possible: true, additionalGrowth: 0 };
        }

        let low = 0;
        let high = 10;
        while (high <= 120 && calcFinalNav(high) < targetNav) {
          high += 10;
        }

        if (calcFinalNav(high) < targetNav) {
          return { possible: false, additionalGrowth: null };
        }

        for (let i = 0; i < 32; i++) {
          const mid = (low + high) / 2;
          if (calcFinalNav(mid) >= targetNav) {
            high = mid;
          } else {
            low = mid;
          }
        }

        return { possible: true, additionalGrowth: high };
      };

      const resS1 = runCalc(growthTableS1, drawdownAmountS1, drawdownOverridesS1, correctedDrawdownYearS1, portfolioValueS1, correctedCrashYearS1);
      const resS2 = runCalc(growthTableS2, drawdownAmountS2, drawdownOverridesS2, correctedDrawdownYearS2, portfolioValueS2, correctedCrashYearS2);

      const answerS1 = resS1.possible
        ? `To maintain NAV in Scenario 1, you need approximately +${(resS1.additionalGrowth as number).toFixed(2)}% annual growth across assets.`
        : "In Scenario 1, maintaining NAV is not achievable within a reasonable growth range under current settings.";

      const answerS2 = resS2.possible
        ? `To maintain NAV in Scenario 2, you need approximately +${(resS2.additionalGrowth as number).toFixed(2)}% annual growth across assets.`
        : "In Scenario 2, maintaining NAV is not achievable within a reasonable growth range under current settings.";

      setChatbotModal({
        isOpen: true,
        question: q,
        answerS1,
        answerS2,
        type: "growth",
        valS1: resS1.possible ? resS1.additionalGrowth : null,
        valS2: resS2.possible ? resS2.additionalGrowth : null
      });
    } else if (intent === "timing") {
      // Question: Drawdown Start Timing To Maintain NAV
      const runCalc = (growthTable: any[], drawdownAmt: number, overrides: number[], scenarioPortfolioValue: number, scenarioCrashYear: number) => {
        const horizonEndYear = startYear + period - 1;

        for (let candidateYear = correctedDrawdownStart; candidateYear <= startYear + period; candidateYear++) {
          const result = simulate({
            portfolioValue: scenarioPortfolioValue,
            period,
            startYear,
            growthTable,
            correctedDrawdownStart,
            correctedDrawdownYear: candidateYear,
            drawdownAmount: drawdownAmt,
            drawdownOverrides: overrides,
            correctedCrashYear: scenarioCrashYear
          });
          const finalNav = result[result.length - 1]?.endValue ?? 0;

          if (finalNav >= scenarioPortfolioValue) {
            return {
              possible: true,
              year: candidateYear <= horizonEndYear ? candidateYear : null
            };
          }
        }

        return { possible: false, year: null };
      };

      const resS1 = runCalc(growthTableS1, drawdownAmountS1, drawdownOverridesS1, portfolioValueS1, correctedCrashYearS1);
      const resS2 = runCalc(growthTableS2, drawdownAmountS2, drawdownOverridesS2, portfolioValueS2, correctedCrashYearS2);

      const answerS1 = resS1.possible
        ? resS1.year !== null
          ? `To maintain NAV in Scenario 1 with the current drawdown amount, drawdowns should start in ${resS1.year} or later.`
          : "In Scenario 1, maintaining NAV requires delaying drawdowns beyond the modeled period."
        : "In Scenario 1, NAV cannot be maintained with the current drawdown amount even when delaying drawdowns within the tested range.";

      const answerS2 = resS2.possible
        ? resS2.year !== null
          ? `To maintain NAV in Scenario 2 with the current drawdown amount, drawdowns should start in ${resS2.year} or later.`
          : "In Scenario 2, maintaining NAV requires delaying drawdowns beyond the modeled period."
        : "In Scenario 2, NAV cannot be maintained with the current drawdown amount even when delaying drawdowns within the tested range.";

      setChatbotModal({
        isOpen: true,
        question: q,
        answerS1,
        answerS2,
        type: "timing",
        valS1: resS1.year,
        valS2: resS2.year
      });
    } else if (intent === "portfolio") {
      // Question 1: Required Portfolio Value
      const runCalc = (
        growthTable: any[],
        drawdownAmt: number,
        overrides: number[],
        corrDrawdownYear: number,
        scenarioCrashYear: number
      ) => {
        const r1 = simulate({
          portfolioValue: 0,
          period,
          startYear,
          growthTable,
          correctedDrawdownStart,
          correctedDrawdownYear: corrDrawdownYear,
          drawdownAmount: drawdownAmt,
          drawdownOverrides: overrides,
          correctedCrashYear: scenarioCrashYear
        });
        const finalNav1 = r1[r1.length - 1]?.endValue ?? 0;
        const B = -finalNav1;

        const r2 = simulate({
          portfolioValue: 1_000_000,
          period,
          startYear,
          growthTable,
          correctedDrawdownStart,
          correctedDrawdownYear: corrDrawdownYear,
          drawdownAmount: drawdownAmt,
          drawdownOverrides: overrides,
          correctedCrashYear: scenarioCrashYear
        });
        const finalNav2 = r2[r2.length - 1]?.endValue ?? 0;
        const A = (finalNav2 + B) / 1_000_000;

        if (A <= 1) return { possible: false, value: 0 };
        const requiredP = B / (A - 1);
        return { possible: true, value: Math.max(0, requiredP) };
      };

      const resS1 = runCalc(growthTableS1, drawdownAmountS1, drawdownOverridesS1, correctedDrawdownYearS1, correctedCrashYearS1);
      const resS2 = runCalc(growthTableS2, drawdownAmountS2, drawdownOverridesS2, correctedDrawdownYearS2, correctedCrashYearS2);

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
    } else if (intent === "allocation") {
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
        const scenarioPortfolioValue = isS1 ? portfolioValueS1 : portfolioValueS2;
        const scenarioCrashYear = isS1 ? correctedCrashYearS1 : correctedCrashYearS2;
        const scenarioPostCrashAlloc = isS1
          ? { eq: equityAllocPostCrashS1, bd: bondAllocPostCrashS1, mmf: mmfAllocPostCrashS1 }
          : { eq: equityAllocPostCrashS2, bd: bondAllocPostCrashS2, mmf: mmfAllocPostCrashS2 };

        allocations.forEach((alloc) => {
          const tempGrowthTable = [];
          const localAdjustments = isS1 ? growthAdjustmentsS1 : growthAdjustmentsS2;
          const localCrashPercent = isS1 ? crashPercentS1 : crashPercentS2;
          const localInterestChange = isS1 ? interestRateChangeS1 : interestRateChangeS2;
          const localBaseRates = isS1
            ? { equity: equityRateS1, bonds: bondRateS1, mmf: mmfRateS1 }
            : { equity: equityRateS2, bonds: bondRateS2, mmf: mmfRateS2 };
          for (let i = 0; i < period; i++) {
            const year = startYear + i;
            const baseYearAdjustment = localAdjustments[i] ?? localBaseRates;
            const isCrashYear = year === scenarioCrashYear;
            const resolvedRow = {
              ...baseYearAdjustment,
              equity: isCrashYear ? -Math.abs(localCrashPercent) : baseYearAdjustment.equity,
              bonds: isCrashYear ? baseYearAdjustment.bonds + localInterestChange : baseYearAdjustment.bonds,
              mmf: baseYearAdjustment.mmf
            };
            const isPostCrash = year > scenarioCrashYear;
            tempGrowthTable.push({
              year,
              equityRate: resolvedRow.equity,
              bondRate: resolvedRow.bonds,
              mmfRate: resolvedRow.mmf,
              equityAlloc: isPostCrash ? scenarioPostCrashAlloc.eq : alloc.eq,
              bondAlloc: isPostCrash ? scenarioPostCrashAlloc.bd : alloc.bd,
              mmfAlloc: isPostCrash ? scenarioPostCrashAlloc.mmf : alloc.mmf
            });
          }

          const r = simulate({
            portfolioValue: scenarioPortfolioValue,
            period,
            startYear,
            growthTable: tempGrowthTable,
            correctedDrawdownStart,
            correctedDrawdownYear: corrDrawdownYear,
            drawdownAmount: drawdownAmt,
            drawdownOverrides: overrides,
            correctedCrashYear: scenarioCrashYear
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
    } else if (intent === "drawdown") {
      // Question 3: Affordable Drawdown
      const runCalc = (growthTable: any[], corrDrawdownYear: number, scenarioPortfolioValue: number, scenarioCrashYear: number) => {
        const r1 = simulate({
          portfolioValue: scenarioPortfolioValue,
          period,
          startYear,
          growthTable,
          correctedDrawdownStart,
          correctedDrawdownYear: corrDrawdownYear,
          drawdownAmount: 0,
          drawdownOverrides: Array(period).fill(undefined),
          correctedCrashYear: scenarioCrashYear
        });
        const C = r1[r1.length - 1]?.endValue ?? 0;

        const r2 = simulate({
          portfolioValue: scenarioPortfolioValue,
          period,
          startYear,
          growthTable,
          correctedDrawdownStart,
          correctedDrawdownYear: corrDrawdownYear,
          drawdownAmount: 100_000,
          drawdownOverrides: Array(period).fill(undefined),
          correctedCrashYear: scenarioCrashYear
        });
        const finalNav2 = r2[r2.length - 1]?.endValue ?? 0;
        const K = (C - finalNav2) / 100_000;

        if (K <= 0) return { possible: false, value: 0 };
        const affordableD = (C - scenarioPortfolioValue) / K;
        return { possible: true, value: Math.max(0, affordableD) };
      };

      const resS1 = runCalc(growthTableS1, correctedDrawdownYearS1, portfolioValueS1, correctedCrashYearS1);
      const resS2 = runCalc(growthTableS2, correctedDrawdownYearS2, portfolioValueS2, correctedCrashYearS2);

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
      const intentLabel: Record<ChatIntent, string> = {
        portfolio: "required starting portfolio value",
        growth: "required growth to maintain NAV",
        allocation: "optimum allocation",
        drawdown: "affordable drawdown",
        timing: "drawdown start year to maintain NAV"
      };
      const suggestionText =
        suggestions.length > 0
          ? `Closest matches: ${suggestions.map((s) => intentLabel[s]).join(" or ")}.`
          : "Try including a target outcome such as maintain NAV, maximize NAV, required starting portfolio, or affordable drawdown.";

      setChatbotModal({
        isOpen: true,
        question: q,
        answerS1: "I could not confidently map this to a portfolio calculation yet. I can answer questions about required portfolio value, required growth to maintain NAV, optimum allocation, and affordable drawdowns.",
        answerS2: `${suggestionText} Intent confidence was ${(confidence * 100).toFixed(0)}%.`,
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
        setPortfolioValueS1(valS1);
        setPortfolioValueS2(valS2 ?? valS1);
      } else if (action === "s1" && valS1 !== null) {
        setPortfolioValueS1(valS1);
      } else if (action === "s2" && valS2 !== null) {
        setPortfolioValueS2(valS2);
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
    } else if (type === "timing") {
      if (action === "all") {
        if (valS1 !== null) {
          setDrawdownYearS1(valS1);
        }
        if (valS2 !== null) {
          setDrawdownYearS2(valS2);
        }
      } else if (action === "s1" && valS1 !== null) {
        setDrawdownYearS1(valS1);
      } else if (action === "s2" && valS2 !== null) {
        setDrawdownYearS2(valS2);
      }
    }

    setChatbotModal(null);
  };

  const handleRevertToDefaults = () => {
    const confirmed = window.confirm("Are you sure you want to revert all settings to their default values?");
    if (!confirmed) return;

    setPortfolioValueS1(3500000);
    setPortfolioValueS2(3500000);
    setAge(55);
    setPeriod(25);
    setCrashPercentS1(45);
    setCrashPercentS2(45);
    setInterestRateChangeS1(-2);
    setInterestRateChangeS2(-2);
    setApplyGrowthToBothScenarios(true);
    setGrowthEditorScenario("s1");
    setDrawdownStartYear(startYear);
    setDrawdownYearS1(startYear + 1);
    setDrawdownYearS2(startYear + 1);
    setDrawdownAmountS1(300000);
    setDrawdownAmountS2(300000);
    setDrawdownOverridesS1([]);
    setDrawdownOverridesS2([]);
    setEquityRateS1(8.0);
    setBondRateS1(3.5);
    setMmfRateS1(1.5);
    setEquityRateS2(8.0);
    setBondRateS2(3.5);
    setMmfRateS2(1.5);
    setEquityAllocS1(10);
    setBondAllocS1(20);
    setMmfAllocS1(70);
    setEquityAllocS2(50);
    setBondAllocS2(40);
    setMmfAllocS2(10);
    setEquityAllocPostCrashS1(70);
    setBondAllocPostCrashS1(20);
    setMmfAllocPostCrashS1(10);
    setEquityAllocPostCrashS2(70);
    setBondAllocPostCrashS2(20);
    setMmfAllocPostCrashS2(10);
    setCrashYearS1(startYear + 1);
    setCrashYearS2(startYear + 1);
    setGrowthAdjustmentsS1([]);
    setGrowthAdjustmentsS2([]);
    setHasManualGrowthAdjustmentsS1(false);
    setHasManualGrowthAdjustmentsS2(false);
    setGrowthRatesResetKeyS1((value) => value + 1);
    setGrowthRatesResetKeyS2((value) => value + 1);
  };

  // BUILD GROWTH TABLE S1
  const growthTableS1 = useMemo(() => {
    const rows = [];
    for (let i = 0; i < period; i++) {
      const year = startYear + i;
      const baseYearAdjustment = growthAdjustmentsS1[i] ?? { equity: equityRateS1, bonds: bondRateS1, mmf: mmfRateS1 };
      const isCrashYear = year === correctedCrashYearS1;
      const resolvedRow = {
        ...baseYearAdjustment,
        equity: isCrashYear ? -Math.abs(crashPercentS1) : baseYearAdjustment.equity,
        bonds: isCrashYear ? baseYearAdjustment.bonds + interestRateChangeS1 : baseYearAdjustment.bonds,
        mmf: baseYearAdjustment.mmf
      };
      const isPostCrash = year > correctedCrashYearS1;
      rows.push({
        year,
        equityRate: resolvedRow.equity,
        bondRate: resolvedRow.bonds,
        mmfRate: resolvedRow.mmf,
        equityAlloc: isPostCrash ? equityAllocPostCrashS1 : equityAllocS1,
        bondAlloc: isPostCrash ? bondAllocPostCrashS1 : bondAllocS1,
        mmfAlloc: isPostCrash ? mmfAllocPostCrashS1 : mmfAllocS1
      });
    }
    return rows;
  }, [
    startYear,
    period,
    equityRateS1,
    bondRateS1,
    mmfRateS1,
    equityAllocS1,
    bondAllocS1,
    mmfAllocS1,
    equityAllocPostCrashS1,
    bondAllocPostCrashS1,
    mmfAllocPostCrashS1,
    growthAdjustmentsS1,
    correctedCrashYearS1,
    crashPercentS1,
    interestRateChangeS1
  ]);

  // BUILD GROWTH TABLE S2
  const growthTableS2 = useMemo(() => {
    const rows = [];
    for (let i = 0; i < period; i++) {
      const year = startYear + i;
      const baseYearAdjustment = growthAdjustmentsS2[i] ?? { equity: equityRateS2, bonds: bondRateS2, mmf: mmfRateS2 };
      const isCrashYear = year === correctedCrashYearS2;
      const resolvedRow = {
        ...baseYearAdjustment,
        equity: isCrashYear ? -Math.abs(crashPercentS2) : baseYearAdjustment.equity,
        bonds: isCrashYear ? baseYearAdjustment.bonds + interestRateChangeS2 : baseYearAdjustment.bonds,
        mmf: baseYearAdjustment.mmf
      };
      const isPostCrash = year > correctedCrashYearS2;
      rows.push({
        year,
        equityRate: resolvedRow.equity,
        bondRate: resolvedRow.bonds,
        mmfRate: resolvedRow.mmf,
        equityAlloc: isPostCrash ? equityAllocPostCrashS2 : equityAllocS2,
        bondAlloc: isPostCrash ? bondAllocPostCrashS2 : bondAllocS2,
        mmfAlloc: isPostCrash ? mmfAllocPostCrashS2 : mmfAllocS2
      });
    }
    return rows;
  }, [
    startYear,
    period,
    equityRateS2,
    bondRateS2,
    mmfRateS2,
    equityAllocS2,
    bondAllocS2,
    mmfAllocS2,
    equityAllocPostCrashS2,
    bondAllocPostCrashS2,
    mmfAllocPostCrashS2,
    growthAdjustmentsS2,
    correctedCrashYearS2,
    crashPercentS2,
    interestRateChangeS2
  ]);

  // BUILD NAV TABLE S1
  const navRowsS1 = useMemo(() => {
    let nav = portfolioValueS1;
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

      const crashApplied = year === correctedCrashYearS1;

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
    portfolioValueS1,
    correctedCrashYearS1,
    correctedDrawdownStart,
    correctedDrawdownYearS1,
    drawdownAmountS1,
    drawdownOverridesS1,
    growthTableS1
  ]);

  // BUILD NAV TABLE S2
  const navRowsS2 = useMemo(() => {
    let nav = portfolioValueS2;
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

      const crashApplied = year === correctedCrashYearS2;

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
    portfolioValueS2,
    correctedCrashYearS2,
    correctedDrawdownStart,
    correctedDrawdownYearS2,
    drawdownAmountS2,
    drawdownOverridesS2,
    growthTableS2
  ]);

  const handleCrashYearChange = (scenario: "s1" | "s2", nextYear: number) => {
    const shiftAdjustments = (adjustments: GrowthAdjustment[], delta: number): GrowthAdjustment[] =>
      Array.from({ length: period }, (_, index) => {
        const sourceIndex = index - delta;
        if (sourceIndex < 0 || sourceIndex >= adjustments.length) {
          return undefined;
        }
        return adjustments[sourceIndex];
      });

    const currentCrashYear = scenario === "s1" ? crashYearS1 : crashYearS2;
    const hasManualActive = scenario === "s1" ? hasManualGrowthAdjustmentsS1 : hasManualGrowthAdjustmentsS2;
    if (hasManualActive && nextYear !== currentCrashYear) {
      const shouldReset = window.confirm(
        "Reset growth rates and discard manual growth adjustments? Click OK to reset, Cancel to shift the crash-year override."
      );

      if (shouldReset) {
        if (scenario === "s1") {
          setGrowthAdjustmentsS1([]);
          setHasManualGrowthAdjustmentsS1(false);
          setGrowthRatesResetKeyS1((value) => value + 1);
        } else {
          setGrowthAdjustmentsS2([]);
          setHasManualGrowthAdjustmentsS2(false);
          setGrowthRatesResetKeyS2((value) => value + 1);
        }
      } else {
        const delta = nextYear - currentCrashYear;
        if (scenario === "s1") {
          setGrowthAdjustmentsS1((current) => shiftAdjustments(current, delta));
        } else {
          setGrowthAdjustmentsS2((current) => shiftAdjustments(current, delta));
        }
      }
    }

    if (scenario === "s1") {
      setCrashYearS1(nextYear);
      if (nextYear !== crashYearS2) {
        setApplyGrowthToBothScenarios(false);
        setGrowthEditorScenario("s1");
      }
    } else {
      setCrashYearS2(nextYear);
      if (nextYear !== crashYearS1) {
        setApplyGrowthToBothScenarios(false);
        setGrowthEditorScenario("s2");
      }
    }
  };

  const handleApplyGrowthRates = () => {
    setGrowthAdjustmentsForEditor([], false);
  };

  const handleApplyGrowthAdjustments = (table: Array<{ year: number; equity: number; bonds: number; mmf: number }>) => {
    const mapped = table.map((row) => ({
      year: row.year,
      equity: row.equity,
      bonds: row.bonds,
      mmf: row.mmf
    }));
    setGrowthAdjustmentsForEditor(mapped, true);
  };

  const buildCurrentSnapshot = (): ScenarioSnapshot => ({
    portfolioValueS1,
    portfolioValueS2,
    age,
    period,
    crashPercentS1,
    crashPercentS2,
    interestRateChangeS1,
    interestRateChangeS2,
    applyGrowthToBothScenarios,
    growthEditorScenario,
    drawdownStartYear,
    drawdownYearS1,
    drawdownYearS2,
    drawdownAmountS1,
    drawdownAmountS2,
    drawdownOverridesS1,
    drawdownOverridesS2,
    equityRateS1,
    bondRateS1,
    mmfRateS1,
    equityRateS2,
    bondRateS2,
    mmfRateS2,
    equityAllocS1,
    bondAllocS1,
    mmfAllocS1,
    equityAllocS2,
    bondAllocS2,
    mmfAllocS2,
    equityAllocPostCrashS1,
    bondAllocPostCrashS1,
    mmfAllocPostCrashS1,
    equityAllocPostCrashS2,
    bondAllocPostCrashS2,
    mmfAllocPostCrashS2,
    crashYearS1,
    crashYearS2,
    growthAdjustmentsS1,
    growthAdjustmentsS2,
    hasManualGrowthAdjustmentsS1,
    hasManualGrowthAdjustmentsS2
  });

  const applyScenarioSnapshot = (snapshot: ScenarioSnapshot) => {
    const resolvedCrashS1 = snapshot.crashPercentS1 ?? 45;
    const resolvedCrashS2 = snapshot.crashPercentS2 ?? resolvedCrashS1;
    const resolvedInterestS1 = snapshot.interestRateChangeS1 ?? -2;
    const resolvedInterestS2 = snapshot.interestRateChangeS2 ?? resolvedInterestS1;
    const resolvedApplyBoth = snapshot.applyGrowthToBothScenarios ?? true;
    const resolvedEditorScenario = snapshot.growthEditorScenario ?? "s1";
    const resolvedGrowthAdjustmentsS1 = snapshot.growthAdjustmentsS1 ?? [];
    const resolvedGrowthAdjustmentsS2 = snapshot.growthAdjustmentsS2 ?? resolvedGrowthAdjustmentsS1;
    const resolvedManualS1 = snapshot.hasManualGrowthAdjustmentsS1 ?? false;
    const resolvedManualS2 = snapshot.hasManualGrowthAdjustmentsS2 ?? resolvedManualS1;
    const resolvedCrashYearS1 = snapshot.crashYearS1 ?? startYear + 1;
    const resolvedCrashYearS2 = snapshot.crashYearS2 ?? snapshot.crashYearS1 ?? startYear + 1;

    setPortfolioValueS1(snapshot.portfolioValueS1 ?? 3500000);
    setPortfolioValueS2(snapshot.portfolioValueS2 ?? snapshot.portfolioValueS1 ?? 3500000);
    setAge(snapshot.age);
    setPeriod(snapshot.period);
    setCrashPercentS1(resolvedCrashS1);
    setCrashPercentS2(resolvedCrashS2);
    setInterestRateChangeS1(resolvedInterestS1);
    setInterestRateChangeS2(resolvedInterestS2);
    setApplyGrowthToBothScenarios(resolvedApplyBoth);
    setGrowthEditorScenario(resolvedEditorScenario);
    setDrawdownStartYear(snapshot.drawdownStartYear);
    setDrawdownYearS1(snapshot.drawdownYearS1);
    setDrawdownYearS2(snapshot.drawdownYearS2);
    setDrawdownAmountS1(snapshot.drawdownAmountS1);
    setDrawdownAmountS2(snapshot.drawdownAmountS2);
    setDrawdownOverridesS1(snapshot.drawdownOverridesS1);
    setDrawdownOverridesS2(snapshot.drawdownOverridesS2);
    setEquityRateS1(snapshot.equityRateS1 ?? 8.0);
    setBondRateS1(snapshot.bondRateS1 ?? 3.5);
    setMmfRateS1(snapshot.mmfRateS1 ?? 1.5);
    setEquityRateS2(snapshot.equityRateS2 ?? snapshot.equityRateS1 ?? 8.0);
    setBondRateS2(snapshot.bondRateS2 ?? snapshot.bondRateS1 ?? 3.5);
    setMmfRateS2(snapshot.mmfRateS2 ?? snapshot.mmfRateS1 ?? 1.5);
    setEquityAllocS1(snapshot.equityAllocS1);
    setBondAllocS1(snapshot.bondAllocS1);
    setMmfAllocS1(snapshot.mmfAllocS1);
    setEquityAllocS2(snapshot.equityAllocS2);
    setBondAllocS2(snapshot.bondAllocS2);
    setMmfAllocS2(snapshot.mmfAllocS2);
    setEquityAllocPostCrashS1(snapshot.equityAllocPostCrashS1 ?? 70);
    setBondAllocPostCrashS1(snapshot.bondAllocPostCrashS1 ?? 20);
    setMmfAllocPostCrashS1(snapshot.mmfAllocPostCrashS1 ?? 10);
    setEquityAllocPostCrashS2(snapshot.equityAllocPostCrashS2 ?? snapshot.equityAllocPostCrashS1 ?? 70);
    setBondAllocPostCrashS2(snapshot.bondAllocPostCrashS2 ?? snapshot.bondAllocPostCrashS1 ?? 20);
    setMmfAllocPostCrashS2(snapshot.mmfAllocPostCrashS2 ?? snapshot.mmfAllocPostCrashS1 ?? 10);
    setCrashYearS1(resolvedCrashYearS1);
    setCrashYearS2(resolvedCrashYearS2);
    setGrowthAdjustmentsS1(resolvedGrowthAdjustmentsS1);
    setGrowthAdjustmentsS2(resolvedGrowthAdjustmentsS2);
    setHasManualGrowthAdjustmentsS1(resolvedManualS1);
    setHasManualGrowthAdjustmentsS2(resolvedManualS2);
    setGrowthRatesResetKeyS1((value) => value + 1);
    setGrowthRatesResetKeyS2((value) => value + 1);
  };

  const getNextScenarioName = (requestedBase: string) => {
    const normalizedBase = requestedBase.trim() || "Scenario";
    const escapedBase = escapeRegExp(normalizedBase);
    const matcher = new RegExp(`^${escapedBase}-(\\d+)$`, "i");

    const highest = savedScenarios.reduce((maxValue, scenario) => {
      const match = scenario.name.match(matcher);
      if (!match) return maxValue;
      const serial = Number.parseInt(match[1], 10);
      return Number.isNaN(serial) ? maxValue : Math.max(maxValue, serial);
    }, 0);

    return `${normalizedBase}-${highest + 1}`;
  };

  const handleSaveScenario = () => {
    const resolvedName = getNextScenarioName(scenarioNameBase);
    const newScenario: SavedScenario = {
      name: resolvedName,
      createdAt: new Date().toISOString(),
      settings: buildCurrentSnapshot()
    };

    setSavedScenarios((current) => [...current, newScenario]);
    setSelectedSavedScenario(resolvedName);
  };

  const handleRecallScenario = () => {
    if (!selectedSavedScenario) return;
    const selected = savedScenarios.find((scenario) => scenario.name === selectedSavedScenario);
    if (!selected) return;
    applyScenarioSnapshot(selected.settings);
  };

  const handleDeleteScenario = () => {
    if (!selectedSavedScenario) return;
    const confirmed = window.confirm(`Delete ${selectedSavedScenario}? This cannot be undone.`);
    if (!confirmed) return;

    setSavedScenarios((current) => current.filter((scenario) => scenario.name !== selectedSavedScenario));
    setSelectedSavedScenario("");
  };

  const handleContinueWithExistingUser = () => {
    if (!selectedExistingUser) return;
    const selected = userProfiles.find((profile) => profile.name === selectedExistingUser);
    if (!selected) return;

    setCurrentUserName(selected.name);
    setScenarioNameBase(selected.scenarioNameBase || selected.name);
    setAge(selected.age);
    setSavedScenarios(selected.savedScenarios || []);
    setSelectedSavedScenario("");
  };

  const handleCreateNewUser = () => {
    const trimmed = newUserName.trim();
    if (!trimmed) return;
    if (userProfiles.some((profile) => profile.name.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }

    const newProfile: UserProfile = {
      name: trimmed,
      age,
      scenarioNameBase: trimmed,
      savedScenarios: []
    };

    setUserProfiles((current) => [...current, newProfile]);
    setCurrentUserName(trimmed);
    setScenarioNameBase(trimmed);
    setSavedScenarios([]);
    setSelectedSavedScenario("");
  };

  return (
    <div className="layout-wrapper">
      <header className="top-banner">
        <h1 className="top-banner-title">Portfolio Model</h1>

        <div className="scenario-toolbar">
          <label className="top-banner-inline-field">
            Period
            <input
              className="scenario-toolbar-control"
              type="number"
              value={period}
              onChange={(event) => setPeriod(Number(event.target.value))}
            />
          </label>

          <label className="top-banner-inline-field">
            Name
            <input
              className="scenario-toolbar-control scenario-name-input"
              type="text"
              aria-label="Scenario name prefix"
              value={scenarioNameBase}
              onChange={(event) => setScenarioNameBase(event.target.value)}
              placeholder="Scenario"
            />
          </label>

          <label className="top-banner-inline-field">
            Age
            <input
              className="scenario-toolbar-control"
              type="number"
              value={age}
              onChange={(event) => setAge(Number(event.target.value))}
            />
          </label>

          <button className="scenario-toolbar-button primary" onClick={handleSaveScenario}>
            Save
          </button>

          <select
            className="scenario-toolbar-control"
            aria-label="Saved scenarios"
            value={selectedSavedScenario}
            onChange={(event) => setSelectedSavedScenario(event.target.value)}
          >
            <option value="">Saved</option>
            {savedScenarios.map((scenario) => (
              <option key={scenario.name} value={scenario.name}>
                {scenario.name}
              </option>
            ))}
          </select>

          <button
            className="scenario-toolbar-button"
            disabled={!selectedSavedScenario}
            onClick={handleRecallScenario}
          >
            Recall
          </button>

          <button
            className="scenario-toolbar-button danger"
            disabled={!selectedSavedScenario}
            onClick={handleDeleteScenario}
          >
            Delete
          </button>
        </div>
      </header>

      <div className="layout-grid">

        {/* COLUMN 1: CONTROLS */}
        <div className="layout-column controls-column">
          <div className="dashboard-box">
            <ChatbotPanel onAsk={handleAskChatbot} onRevertToDefaults={handleRevertToDefaults} />
          </div>

          <div className="dashboard-box">
            <PortfolioControlsPanel
              equityRateS1={equityRateS1}
              bondRateS1={bondRateS1}
              mmfRateS1={mmfRateS1}
              equityRateS2={equityRateS2}
              bondRateS2={bondRateS2}
              mmfRateS2={mmfRateS2}
              applyToBothScenarios={applyGrowthToBothScenarios}
              onApply={(settings) => {
                setEquityRateS1(settings.equityS1);
                setBondRateS1(settings.bondsS1);
                setMmfRateS1(settings.mmfS1);
                setEquityRateS2(settings.equityS2);
                setBondRateS2(settings.bondsS2);
                setMmfRateS2(settings.mmfS2);
                if (applyGrowthToBothScenarios) {
                  setGrowthAdjustmentsS1([]);
                  setGrowthAdjustmentsS2([]);
                  setHasManualGrowthAdjustmentsS1(false);
                  setHasManualGrowthAdjustmentsS2(false);
                  setGrowthRatesResetKeyS1((value) => value + 1);
                  setGrowthRatesResetKeyS2((value) => value + 1);
                } else if (growthEditorScenario === "s1") {
                  setGrowthAdjustmentsS1([]);
                  setHasManualGrowthAdjustmentsS1(false);
                  setGrowthRatesResetKeyS1((value) => value + 1);
                } else {
                  setGrowthAdjustmentsS2([]);
                  setHasManualGrowthAdjustmentsS2(false);
                  setGrowthRatesResetKeyS2((value) => value + 1);
                }
              }}
            />
          </div>

          <div className="dashboard-box growth-box">
            <GrowthByYearPanel
              startYear={startYear}
              period={period}
              applyToBothScenarios={applyGrowthToBothScenarios}
              selectedScenario={growthEditorScenario}
              onApplyToBothScenariosChange={handleApplyToBothScenariosChange}
              onSelectedScenarioChange={setGrowthEditorScenario}
              crashYear={activeCrashYear}
              crashPercent={activeCrashPercent}
              onCrashPercentChange={setCrashPercentForEditor}
              interestRateChange={activeInterestRateChange}
              onInterestRateChange={setInterestRateChangeForEditor}
              equityRate={activeEquityRate}
              bondRate={activeBondRate}
              mmfRate={activeMmfRate}
              resetTrigger={activeGrowthResetKey}
              onApplyGrowthRates={handleApplyGrowthRates}
              onApplyGrowthAdjustments={handleApplyGrowthAdjustments}
            />
          </div>
        </div>

        {/* COLUMN 2: CHARTS */}
        <div className="layout-column">
          <div className="portfolio-row">
            <div className="dashboard-box portfolio-split-box">
              <CrashYearPanel
                title="Portfolio 1"
                portfolioValue={portfolioValueS1}
                onPortfolioValueChange={setPortfolioValueS1}
                equityAllocBefore={equityAllocS1}
                onEquityAllocBeforeChange={setEquityAllocS1}
                bondAllocBefore={bondAllocS1}
                onBondAllocBeforeChange={setBondAllocS1}
                mmfAllocBefore={mmfAllocS1}
                onMmfAllocBeforeChange={setMmfAllocS1}
                equityAllocAfter={equityAllocPostCrashS1}
                onEquityAllocAfterChange={setEquityAllocPostCrashS1}
                bondAllocAfter={bondAllocPostCrashS1}
                onBondAllocAfterChange={setBondAllocPostCrashS1}
                mmfAllocAfter={mmfAllocPostCrashS1}
                onMmfAllocAfterChange={setMmfAllocPostCrashS1}
              />
            </div>
            <div className="dashboard-box portfolio-split-box">
              <CrashYearPanel
                title="Portfolio 2"
                portfolioValue={portfolioValueS2}
                onPortfolioValueChange={setPortfolioValueS2}
                equityAllocBefore={equityAllocS2}
                onEquityAllocBeforeChange={setEquityAllocS2}
                bondAllocBefore={bondAllocS2}
                onBondAllocBeforeChange={setBondAllocS2}
                mmfAllocBefore={mmfAllocS2}
                onMmfAllocBeforeChange={setMmfAllocS2}
                equityAllocAfter={equityAllocPostCrashS2}
                onEquityAllocAfterChange={setEquityAllocPostCrashS2}
                bondAllocAfter={bondAllocPostCrashS2}
                onBondAllocAfterChange={setBondAllocPostCrashS2}
                mmfAllocAfter={mmfAllocPostCrashS2}
                onMmfAllocAfterChange={setMmfAllocPostCrashS2}
              />
            </div>
          </div>
          <div className="dashboard-box chart-box">
            <NavChartPanel
              title="Scenario 1 NAV Chart"
              navRows={navRowsS1}
              age={age}
              startYear={startYear}
              period={period}
              crashYear={correctedCrashYearS1}
              onCrashYearChange={(year) => handleCrashYearChange("s1", year)}
            />
          </div>
          <div className="dashboard-box chart-box">
            <NavChartPanel
              title="Scenario 2 NAV Chart"
              navRows={navRowsS2}
              age={age}
              startYear={startYear}
              period={period}
              crashYear={correctedCrashYearS2}
              onCrashYearChange={(year) => handleCrashYearChange("s2", year)}
            />
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
          <div className="dashboard-box table-box">
            <NavPerYearPanel
              title="Scenario 1 NAV per Year"
              navRows={navRowsS1}
              growthTable={growthTableS1}
              initialPortfolioValue={portfolioValueS1}
              drawdownStartYear={correctedDrawdownStart}
              drawdownYear={correctedDrawdownYearS1}
              drawdownAmount={drawdownAmountS1}
              onApplyDrawdownChanges={setDrawdownOverridesS1}
            />
          </div>
          <div className="dashboard-box table-box">
            <NavPerYearPanel
              title="Scenario 2 NAV per Year"
              navRows={navRowsS2}
              growthTable={growthTableS2}
              initialPortfolioValue={portfolioValueS2}
              drawdownStartYear={correctedDrawdownStart}
              drawdownYear={correctedDrawdownYearS2}
              drawdownAmount={drawdownAmountS2}
              onApplyDrawdownChanges={setDrawdownOverridesS2}
            />
          </div>
        </div>

      </div>

      <footer className="bottom-banner">
        <div>{savedScenarios.length} saved scenario{savedScenarios.length === 1 ? "" : "s"}</div>
        <div>Autosave format: {(scenarioNameBase.trim() || "Scenario") + "-n"}</div>
      </footer>

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
              {chatbotModal.type !== "unknown" && chatbotModal.type !== "growth" && (
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
