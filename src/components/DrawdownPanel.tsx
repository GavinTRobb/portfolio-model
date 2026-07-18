import { useState } from "react";

interface Props {
  drawdownYear: number;
  onDrawdownYearChange: (year: number) => void;

  drawdownAmount: number;
  onDrawdownAmountChange: (amt: number) => void;

  onApply: () => void;
}

export default function DrawdownPanel({
  drawdownYear,
  onDrawdownYearChange,

  drawdownAmount,
  onDrawdownAmountChange,

  onApply
}: Props) {

  const formatNumber = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    const num = Number(raw);
    if (!isNaN(num)) onDrawdownAmountChange(num);
  };

  return (
    <div className="panel-container">
      <h2 className="control-title">Drawdown Settings</h2>

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
          onChange={handleAmountInput}
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
