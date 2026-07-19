import { useEffect, useMemo, useState } from "react";

interface Props {
  title?: string;
  navRows: {
    year: number;
    endValue: number;
    crashApplied?: boolean;
    drawdownApplied?: boolean;
    growthRate?: number;
  }[];
  growthTable: Array<{
    year: number;
    equityRate: number;
    bondRate: number;
    mmfRate: number;
    equityAlloc: number;
    bondAlloc: number;
    mmfAlloc: number;
  }>;
  initialPortfolioValue: number;
  drawdownStartYear: number;
  drawdownYear: number;
  drawdownAmount: number;
  onApplyDrawdownChanges?: (values: number[]) => void;
}

export default function NavPerYearPanel({
  title = "NAV per Year",
  navRows,
  growthTable,
  initialPortfolioValue,
  drawdownStartYear,
  drawdownYear,
  drawdownAmount,
  onApplyDrawdownChanges
}: Props) {
  const fmt = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const fmtPct = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const formatInputValue = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const getDefaultDrawdownValue = (index: number) => {
    const row = navRows[index];
    if (!row) return 0;
    const defaultDrawdown =
      row.year >= drawdownYear && row.year >= drawdownStartYear ? drawdownAmount : 0;
    return defaultDrawdown > 0 ? -defaultDrawdown : 0;
  };

  const [draftDrawdowns, setDraftDrawdowns] = useState<string[]>(() =>
    navRows.map((_, index) => formatInputValue(getDefaultDrawdownValue(index)))
  );

  useEffect(() => {
    setDraftDrawdowns(navRows.map((_, index) => formatInputValue(getDefaultDrawdownValue(index))));
  }, [navRows.length, drawdownStartYear, drawdownYear, drawdownAmount]);

  const parseDraftValue = (rawValue: string | undefined, fallback: number) => {
    const cleanedValue = (rawValue ?? "").replace(/,/g, "").trim();
    if (cleanedValue === "") {
      return fallback;
    }

    const parsedValue = Number(cleanedValue);
    return Number.isNaN(parsedValue) ? fallback : parsedValue;
  };

  const rowResults = useMemo(() => {
    return navRows.reduce<
    Array<{
      startValue: number;
      eqGrowth: number;
      bdGrowth: number;
      mmfGrowth: number;
      interimValue: number;
      drawdownValue: number;
      drawdownPct: number;
      endValue: number;
      eqEndValue: number;
      bdEndValue: number;
      mmfEndValue: number;
    }>
    >((acc, row, idx) => {
      const startValue = idx === 0 ? initialPortfolioValue : acc[idx - 1].endValue;
      const growthRow = growthTable[idx];

      const eqGrowth = growthRow
        ? startValue * (growthRow.equityAlloc / 100) * (growthRow.equityRate / 100)
        : 0;
      const bdGrowth = growthRow
        ? startValue * (growthRow.bondAlloc / 100) * (growthRow.bondRate / 100)
        : 0;
      const mmfGrowth = growthRow
        ? startValue * (growthRow.mmfAlloc / 100) * (growthRow.mmfRate / 100)
        : 0;

      const interimValue = startValue + eqGrowth + bdGrowth + mmfGrowth;
      const defaultDrawdownValue = getDefaultDrawdownValue(idx);
      const drawdownValue = parseDraftValue(draftDrawdowns[idx], defaultDrawdownValue);
      const drawdownMagnitude = Math.abs(drawdownValue);
      const drawdownPct =
        interimValue !== 0 ? (drawdownValue / interimValue) * 100 : 0;
      const endValue = interimValue + drawdownValue;
      const eqStartValue = startValue * ((growthRow?.equityAlloc ?? 0) / 100);
      const bdStartValue = startValue * ((growthRow?.bondAlloc ?? 0) / 100);
      const mmfStartValue = startValue * ((growthRow?.mmfAlloc ?? 0) / 100);
      const eqEndValue = eqStartValue + eqGrowth - drawdownMagnitude * ((growthRow?.equityAlloc ?? 0) / 100);
      const bdEndValue = bdStartValue + bdGrowth - drawdownMagnitude * ((growthRow?.bondAlloc ?? 0) / 100);
      const mmfEndValue = mmfStartValue + mmfGrowth - drawdownMagnitude * ((growthRow?.mmfAlloc ?? 0) / 100);

      acc.push({
        startValue,
        eqGrowth,
        bdGrowth,
        mmfGrowth,
        interimValue,
        drawdownValue,
        drawdownPct,
        endValue,
        eqEndValue,
        bdEndValue,
        mmfEndValue
      });

      return acc;
    }, []);
  }, [draftDrawdowns, drawdownAmount, drawdownStartYear, drawdownYear, growthTable, initialPortfolioValue, navRows]);

  const startValues = rowResults.map((row) => row.startValue);
  const eqGrowthValues = rowResults.map((row) => row.eqGrowth);
  const bdGrowthValues = rowResults.map((row) => row.bdGrowth);
  const mmfGrowthValues = rowResults.map((row) => row.mmfGrowth);
  const interimValues = rowResults.map((row) => row.interimValue);
  const drawdownValues = rowResults.map((row) => row.drawdownValue);
  const drawdownPctValues = rowResults.map((row) => row.drawdownPct);
  const endValues = rowResults.map((row) => row.endValue);
  const eqEndValues = rowResults.map((row) => row.eqEndValue);
  const bdEndValues = rowResults.map((row) => row.bdEndValue);
  const mmfEndValues = rowResults.map((row) => row.mmfEndValue);

  const handleDrawdownInput = (index: number, rawValue: string) => {
    setDraftDrawdowns((prev) => {
      const updated = [...prev];
      updated[index] = rawValue;
      return updated;
    });
  };

  const handleApplyDrawdownChanges = () => {
    const values = draftDrawdowns.map((rawValue, index) => {
      const fallback = getDefaultDrawdownValue(index);
      const parsedValue = parseDraftValue(rawValue, fallback);
      return parsedValue < 0 ? parsedValue : -Math.abs(parsedValue);
    });

    onApplyDrawdownChanges?.(values);
  };

  return (
    <div className="panel-container">
      <h2 className="control-title">{title}</h2>

      <div className="bottom-align" style={{ marginBottom: "10px" }}>
        <button className="apply-button" onClick={handleApplyDrawdownChanges}>
          Apply Drawdown Changes
        </button>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        <table className="growth-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Start Value</th>
              <th>EQ Growth</th>
              <th>BD Growth</th>
              <th>MMF Growth</th>
              <th>Interim Value</th>
              <th>Drawdown</th>
              <th>Drawdown %</th>
              <th>EQ End Value</th>
              <th>BD End Value</th>
              <th>MMF End Value</th>
              <th>End Value</th>
            </tr>
          </thead>

          <tbody>
            {navRows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.year}</td>
                <td>{fmt(startValues[idx])}</td>
                <td>{fmt(eqGrowthValues[idx])}</td>
                <td>{fmt(bdGrowthValues[idx])}</td>
                <td>{fmt(mmfGrowthValues[idx])}</td>
                <td>{fmt(interimValues[idx])}</td>
                <td>
                  <input
                    type="text"
                    value={draftDrawdowns[idx] ?? ""}
                    onChange={(e) => handleDrawdownInput(idx, e.target.value)}
                    style={{ width: 100 }}
                  />
                </td>
                <td>{fmtPct(drawdownPctValues[idx])}%</td>
                <td>{fmt(eqEndValues[idx])}</td>
                <td>{fmt(bdEndValues[idx])}</td>
                <td>{fmt(mmfEndValues[idx])}</td>
                <td>{fmt(endValues[idx])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
