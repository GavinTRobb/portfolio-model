import { useState } from "react";

interface Props {
  startYear: number;
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
  startYear,
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

  const formatNumber = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const minYear = startYear;
  const maxYear = startYear + period - 1;
  const sliderValue = Math.min(Math.max(crashYear, minYear), maxYear);

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
        <label style={{ width: 100 }}>Portfolio Value</label>
        <input
          type="text"
          value={formatNumber(portfolio)}
          onChange={handlePortfolioInput}
          style={{ width: 100, maxWidth: 100, marginRight: 12 }}
        />

        <label style={{ width: 35 }}>Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => onAgeChange(Number(e.target.value))}
          style={{ width: 50, maxWidth: 50, marginRight: 12 }}
        />

        <label style={{ width: 45 }}>Period</label>
        <input
          type="number"
          value={period}
          onChange={(e) => onPeriodChange(Number(e.target.value))}
          style={{ width: 50, maxWidth: 50 }}
        />
      </div>

      <div className="control-row">
        <label style={{ width: 60 }}>Crash %</label>
        <input
          type="number"
          step="1"
          value={crashPercent}
          onChange={(e) => onCrashPercentChange(Number(e.target.value))}
          style={{ width: 60, maxWidth: 60 }}
        />
        <span className="percent" style={{ marginRight: 16 }}>%</span>

        <label style={{ width: 130 }}>Interest Rate Change</label>
        <input
          type="number"
          step="0.1"
          value={interestRateChange}
          onChange={(e) => onInterestRateChange(Number(e.target.value))}
          style={{ width: 60, maxWidth: 60 }}
        />
        <span className="percent">%</span>
      </div>

      {/* BOTTOM — SLIDER */}
      <div className="bottom-align" style={{ marginTop: "8px" }}>
        <div className="slider-label">Crash Year: {crashYear}</div>

        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={sliderValue}
          onChange={(e) => onCrashYearChange(Number(e.target.value))}
          className="button-slider"
        />
      </div>

    </div>
  );
}
