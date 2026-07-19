import { useState } from "react";

interface Props {
  portfolio: number;
  onPortfolioChange: (value: number) => void;

  age: number;
  onAgeChange: (value: number) => void;

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

  age,
  onAgeChange,

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

      <div className="control-row">
        <label>Portfolio Value</label>
        <input
          type="text"
          value={formatNumber(portfolio)}
          onChange={handlePortfolioInput}
          style={{ width: 120, maxWidth: 120 }}
        />
        <label style={{ width: 60, marginLeft: 8 }}>Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => onAgeChange(Number(e.target.value))}
          style={{ width: 70, maxWidth: 70 }}
        />
      </div>

      <div className="control-row">
        <label>Period</label>
        <input
          type="number"
          value={period}
          onChange={(e) => onPeriodChange(Number(e.target.value))}
          style={{ width: 90, maxWidth: 90 }}
        />
      </div>

      <div className="control-row">
        <label>Crash %</label>
        <input
          type="number"
          step="1"
          value={crashPercent}
          onChange={(e) => onCrashPercentChange(Number(e.target.value))}
          style={{ width: 70, maxWidth: 70 }}
        />
        <span className="percent">%</span>
      </div>

      <div className="control-row">
        <label>Interest Rate Change</label>
        <input
          type="number"
          step="0.1"
          value={interestRateChange}
          onChange={(e) => onInterestRateChange(Number(e.target.value))}
          style={{ width: 70, maxWidth: 70 }}
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
