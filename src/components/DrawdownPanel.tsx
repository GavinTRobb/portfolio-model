import { useState } from "react";

interface Props {
  drawdownYear: number;
  onDrawdownYearChange: (v: number) => void;

  drawdownAmount: number;
  onDrawdownAmountChange: (v: number) => void;

  drawdownStartYear: number;
  onDrawdownStartYearChange: (v: number) => void;

  onApply: () => void;
}

export default function DrawdownPanel({
  drawdownYear,
  onDrawdownYearChange,

  drawdownAmount,
  onDrawdownAmountChange,

  drawdownStartYear,
  onDrawdownStartYearChange,

  onApply
}: Props) {
  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const handleDrawdownAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    const num = Number(raw);
    if (!isNaN(num)) onDrawdownAmountChange(num);
  };

  return (
    <div className="panel-container">
      <h2 className="control-title">Drawdown Settings</h2>

      <div className="control-row">
        <label>Start Year</label>
        <input
          type="number"
          value={drawdownStartYear}
          onChange={(e) => onDrawdownStartYearChange(Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <label>Drawdown Year</label>
        <input
          type="number"
          value={drawdownYear}
          onChange={(e) => onDrawdownYearChange(Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <label>Drawdown Amount</label>
        <input
          type="text"
          value={formatNumber(drawdownAmount)}
          onChange={handleDrawdownAmountInput}
        />
      </div>

      <div className="bottom-align">
        <button className="apply-button" onClick={onApply}>
          Apply Changes
        </button>
      </div>
    </div>
  );
}
