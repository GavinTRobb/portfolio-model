import { useEffect, useState } from "react";

interface Props {
  startYear: number;
  period: number;
  applyToBothScenarios: boolean;
  selectedScenario: "s1" | "s2";
  onApplyToBothScenariosChange: (checked: boolean) => void;
  onSelectedScenarioChange: (scenario: "s1" | "s2") => void;
  crashYear?: number;
  crashPercent: number;
  onCrashPercentChange: (value: number) => void;
  interestRateChange: number;
  onInterestRateChange: (value: number) => void;

  equityRate: number;
  bondRate: number;
  mmfRate: number;

  resetTrigger: number;
  onApplyGrowthRates: () => void;
  onApplyGrowthAdjustments: (table: GrowthRow[]) => void;
}

export interface GrowthRow {
  year: number;
  equity: number;
  bonds: number;
  mmf: number;
}

export default function GrowthByYearPanel({
  startYear,
  period,
  applyToBothScenarios,
  selectedScenario,
  onApplyToBothScenariosChange,
  onSelectedScenarioChange,
  crashYear,
  crashPercent,
  onCrashPercentChange,
  interestRateChange,
  onInterestRateChange,
  equityRate,
  bondRate,
  mmfRate,
  resetTrigger,
  onApplyGrowthRates,
  onApplyGrowthAdjustments
}: Props) {

  const [rows, setRows] = useState<GrowthRow[]>([]);

  // Repopulate table when growth rates change OR resetTrigger increments
  useEffect(() => {
    const newRows: GrowthRow[] = [];
    for (let i = 0; i < period; i++) {
      const year = startYear + i;
      const defaultEquity = year === crashYear ? -Math.abs(crashPercent ?? 0) : equityRate;
      newRows.push({
        year,
        equity: defaultEquity,
        bonds: bondRate,
        mmf: mmfRate
      });
    }
    setRows(newRows);
  }, [equityRate, bondRate, mmfRate, period, resetTrigger, startYear, crashYear, crashPercent]);

  const updateCell = (index: number, field: keyof GrowthRow, value: number) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleApplyGrowthAdjustments = () => {
    const confirmed = window.confirm(
      "Apply these manual growth adjustments to the NAV calculation?"
    );
    if (!confirmed) return;
    onApplyGrowthAdjustments(rows);
  };

  return (
    <div className="panel-container">
      <h2 className="control-title">Growth by Year</h2>

      <div className="control-row" style={{ marginBottom: "8px" }}>
        <label style={{ width: 140 }}>Crash %</label>
        <input
          className="compact-percent-input"
          type="number"
          step="1"
          value={crashPercent}
          onChange={(e) => onCrashPercentChange(Number(e.target.value))}
          style={{ width: 110, maxWidth: 110 }}
        />
        <span className="percent" style={{ marginRight: 16 }}>%</span>

        <label style={{ width: 140 }}>Interest Rate Change</label>
        <input
          className="compact-percent-input"
          type="number"
          step="0.1"
          value={interestRateChange}
          onChange={(e) => onInterestRateChange(Number(e.target.value))}
          style={{ width: 110, maxWidth: 110 }}
        />
        <span className="percent">%</span>
      </div>

      <div className="control-row" style={{ marginBottom: "10px" }}>
        <label style={{ width: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={applyToBothScenarios}
            onChange={(e) => onApplyToBothScenariosChange(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          Apply to both scenarios
        </label>

        <label style={{ width: "auto" }}>Scenario</label>
        <select
          value={selectedScenario}
          onChange={(e) => onSelectedScenarioChange(e.target.value as "s1" | "s2")}
          disabled={applyToBothScenarios}
          style={{ width: 130, maxWidth: 130 }}
        >
          <option value="s1">Scenario 1</option>
          <option value="s2">Scenario 2</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button className="apply-button" onClick={handleApplyGrowthAdjustments}>
          Apply Growth Adjustments
        </button>
      </div>

      {/* TABLE */}
      <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
        <table className="growth-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Equity %</th>
              <th>Bonds %</th>
              <th>MMF %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.year}</td>

                <td>
                  <input
                    className="compact-percent-input"
                    type="number"
                    value={row.equity}
                    onChange={(e) =>
                      updateCell(idx, "equity", Number(e.target.value))
                    }
                  />
                </td>

                <td>
                  <input
                    className="compact-percent-input"
                    type="number"
                    value={row.bonds}
                    onChange={(e) =>
                      updateCell(idx, "bonds", Number(e.target.value))
                    }
                  />
                </td>

                <td>
                  <input
                    className="compact-percent-input"
                    type="number"
                    value={row.mmf}
                    onChange={(e) =>
                      updateCell(idx, "mmf", Number(e.target.value))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
