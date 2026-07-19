import { useState } from "react";

interface Props {
  drawdownStartYear: number;
  onDrawdownStartYearChange: (v: number) => void;

  drawdownYearS1: number;
  onDrawdownYearS1Change: (v: number) => void;

  drawdownYearS2: number;
  onDrawdownYearS2Change: (v: number) => void;

  drawdownAmountS1: number;
  onDrawdownAmountS1Change: (v: number) => void;

  drawdownAmountS2: number;
  onDrawdownAmountS2Change: (v: number) => void;

  onApply: () => void;
}

export default function DrawdownPanel({
  drawdownStartYear,
  onDrawdownStartYearChange,

  drawdownYearS1,
  onDrawdownYearS1Change,

  drawdownYearS2,
  onDrawdownYearS2Change,

  drawdownAmountS1,
  onDrawdownAmountS1Change,

  drawdownAmountS2,
  onDrawdownAmountS2Change,

  onApply
}: Props) {
  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="panel-container">
      <h2 className="control-title">Drawdown Settings</h2>

      {/* START YEAR (SHARED) */}
      <div className="control-row" style={{ marginBottom: "12px" }}>
        <label style={{ width: 140 }}>Start Year</label>
        <input
          type="number"
          value={drawdownStartYear}
          onChange={(e) => onDrawdownStartYearChange(Number(e.target.value))}
          style={{ width: 110 }}
        />
      </div>

      {/* HEADERS */}
      <div className="control-row" style={{ fontWeight: 600, marginBottom: "6px" }}>
        <label style={{ width: 140 }}></label>
        <div style={{ width: 110, textAlign: "center" }}>Scenario 1</div>
        <div style={{ width: 110, textAlign: "center", marginLeft: "10px" }}>Scenario 2</div>
      </div>

      {/* DRAWDOWN YEAR */}
      <div className="control-row" style={{ marginBottom: "8px" }}>
        <label style={{ width: 140 }}>Drawdown Year</label>
        <input
          type="number"
          value={drawdownYearS1}
          onChange={(e) => onDrawdownYearS1Change(Number(e.target.value))}
          style={{ width: 110 }}
        />
        <input
          type="number"
          value={drawdownYearS2}
          onChange={(e) => onDrawdownYearS2Change(Number(e.target.value))}
          style={{ width: 110, marginLeft: "10px" }}
        />
      </div>

      {/* DRAWDOWN AMOUNT */}
      <div className="control-row" style={{ marginBottom: "12px" }}>
        <label style={{ width: 140 }}>Drawdown Amount</label>
        <input
          type="text"
          value={formatNumber(drawdownAmountS1)}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, "");
            const num = Number(raw);
            if (!isNaN(num)) onDrawdownAmountS1Change(num);
          }}
          style={{ width: 110 }}
        />
        <input
          type="text"
          value={formatNumber(drawdownAmountS2)}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, "");
            const num = Number(raw);
            if (!isNaN(num)) onDrawdownAmountS2Change(num);
          }}
          style={{ width: 110, marginLeft: "10px" }}
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
