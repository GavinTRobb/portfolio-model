import { useEffect, useState } from "react";
import { GrowthRow } from "./GrowthByYearPanel";

interface Props {
  period: number;
  portfolio: number;

  equityAlloc: number;
  bondAlloc: number;
  mmfAlloc: number;

  drawdownYear: number;
  drawdownAmount: number;

  growthTable: GrowthRow[];
  resetTrigger: number;

  onNavChange: (rows: NavRow[]) => void;
}

interface NavRow {
  year: number;
  start: number;
  eqGrowth: number;
  bdGrowth: number;
  mmfGrowth: number;
  interim: number;
  drawdown: number;
  drawdownPct: number;
  end: number;
}

export default function NavPerYearPanel({
  period,
  portfolio,

  equityAlloc,
  bondAlloc,
  mmfAlloc,

  drawdownYear,
  drawdownAmount,

  growthTable,
  resetTrigger,

  onNavChange
}: Props) {
  const [rows, setRows] = useState<NavRow[]>([]);
  const [draftRows, setDraftRows] = useState<NavRow[]>([]);

  const recalc = (useDraft = false) => {
    if (!growthTable || growthTable.length === 0) return;

    const newRows: NavRow[] = [];
    let startValue = portfolio;

    for (let i = 0; i < period; i++) {
      const yr = 2026 + i;

      const equityRate = growthTable[i]?.equity ?? 0;
      const bondRate = growthTable[i]?.bonds ?? 0;
      const mmfRate = growthTable[i]?.mmf ?? 0;

      const eqGrowth = startValue * (equityAlloc / 100) * (equityRate / 100);
      const bdGrowth = startValue * (bondAlloc / 100) * (bondRate / 100);
      const mmfGrowth = startValue * (mmfAlloc / 100) * (mmfRate / 100);

      const interim = startValue + eqGrowth + bdGrowth + mmfGrowth;

      const drawdown = useDraft
        ? draftRows[i].drawdown
        : yr >= drawdownYear
        ? drawdownAmount
        : 0;

      const drawdownPct = drawdown > 0 ? (drawdown / interim) * 100 : 0;

      const endValue = interim - drawdown;

      newRows.push({
        year: yr,
        start: startValue,
        eqGrowth,
        bdGrowth,
        mmfGrowth,
        interim,
        drawdown,
        drawdownPct,
        end: endValue
      });

      startValue = endValue;
    }

    setRows(newRows);
    setDraftRows(newRows);
    onNavChange(newRows);
  };

  useEffect(() => {
    recalc(false);
  }, [
    period,
    portfolio,
    equityAlloc,
    bondAlloc,
    mmfAlloc,
    drawdownYear,
    drawdownAmount,
    growthTable,
    resetTrigger
  ]);

  const editDrawdown = (index: number, value: number) => {
    const updated = [...draftRows];
    updated[index].drawdown = value;
    setDraftRows(updated);
  };

  const fmt = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const fmtPct = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div className="panel-container">
      <h2 className="control-title">NAV per Year</h2>

      <div className="bottom-align" style={{ marginBottom: "10px" }}>
        <button className="apply-button" onClick={() => recalc(true)}>
          Apply Drawdown Adjustments
        </button>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        <table className="growth-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Start</th>
              <th>EQ Growth</th>
              <th>BD Growth</th>
              <th>MMF Growth</th>
              <th>Interim</th>
              <th>Drawdown</th>
              <th>Drawdown %</th>
              <th>End</th>
            </tr>
          </thead>

          <tbody>
            {draftRows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.year}</td>
                <td>{fmt(row.start)}</td>
                <td>{fmt(row.eqGrowth)}</td>
                <td>{fmt(row.bdGrowth)}</td>
                <td>{fmt(row.mmfGrowth)}</td>
                <td>{fmt(row.interim)}</td>

                <td>
                  <input
                    type="number"
                    value={row.drawdown}
                    onChange={(e) =>
                      editDrawdown(idx, Number(e.target.value))
                    }
                  />
                </td>

                <td>{fmtPct(row.drawdownPct)}%</td>
                <td>{fmt(row.end)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
