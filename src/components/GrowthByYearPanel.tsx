import { useEffect, useState } from "react";

interface Props {
  period: number;

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
  period,
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
      newRows.push({
        year: 2026 + i,
        equity: equityRate,
        bonds: bondRate,
        mmf: mmfRate
      });
    }
    setRows(newRows);
  }, [equityRate, bondRate, mmfRate, period, resetTrigger]);

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

      <div className="bottom-align" style={{ marginBottom: "10px" }}>
        <button className="apply-button" onClick={onApplyGrowthRates}>
          Apply Growth Rates
        </button>
        <button className="apply-button" onClick={handleApplyGrowthAdjustments}>
          Apply Growth Adjustments
        </button>
      </div>

      {/* TABLE */}
      <div style={{ overflowY: "auto", flex: 1 }}>
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
                    type="number"
                    value={row.equity}
                    onChange={(e) =>
                      updateCell(idx, "equity", Number(e.target.value))
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={row.bonds}
                    onChange={(e) =>
                      updateCell(idx, "bonds", Number(e.target.value))
                    }
                  />
                </td>

                <td>
                  <input
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
