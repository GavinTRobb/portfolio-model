import { useState } from "react";

interface Props {
  portfolio: number;
  onPortfolioChange: (value: number) => void;

  crashYear: number;
  onCrashYearChange: (year: number) => void;

  crashPercent: number;
  onCrashPercentChange: (pct: number) => void;

  interestRateChange: number;
  onInterestRateChange: (pct: number) => void;

  period: number;
  onPeriodChange: (yrs: number) => void;
}

export default function CrashYearPanel({
  portfolio,
  onPortfolioChange,

  crashYear,
  onCrashYearChange,

  crashPercent,
  onCrashPercentChange,

  interestRateChange,
  onInterestRateChange,

  period,
  onPeriodChange
}: Props) {

  const CURRENT_YEAR = 2026;

  const formatNumber = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const handlePortfolioInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    const num = Number(raw);
    if (!isNaN(num)) onPortfolioChange(num);
  };

  return (
    <div className="panel-container">

      {/* TITLE */}
      <h2 className="control-title">Portfolio</h2>

      {/* TOP LINE */}
      <div className="control-row">
        <label>Portfolio Value</label>
        <input
          type="text"
          value={formatNumber(portfolio)}
          onChange={handlePortfolioInput}
        />

        <label>Period</label>
        <input
          type="number"
          value={period}
          onChange={(e) => onPeriodChange(Number(e.target.value))}
        />
      </div>

      {/* SECOND LINE */}
      <div className="control-row">
        <label>Crash %</label>
        <input
          type="number"
          step="1"
          value={crashPercent}
          onChange={(e) => onCrashPercentChange(Number(e.target.value))}
        />
        <span className="percent">%</span>

        <label>Interest Rate Change</label>
        <input
          type="number"
          step="0.1"
          value={interestRateChange}
          onChange={(e) => onInterestRateChange(Number(e.target.value))}
        />
        <span className="percent">%</span>
      </div>

      {/* BOTTOM — SLIDER */}
      <div className="bottom-align">
        <div className="slider-label">
          Crash Year: {crashYear === 0 ? "None" : CURRENT_YEAR + crashYear}
        </div>

        <input
          type="range"
          min={0}
          max={period}
          step={1}
          value={crashYear}
          onChange={(e) => onCrashYearChange(Number(e.target.value))}
          className="button-slider"
        />
      </div>

    </div>
  );
}
