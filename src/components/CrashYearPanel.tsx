interface Props {
  title: string;
  portfolioValue: number;
  onPortfolioValueChange: (value: number) => void;

  equityAllocBefore: number;
  onEquityAllocBeforeChange: (value: number) => void;
  bondAllocBefore: number;
  onBondAllocBeforeChange: (value: number) => void;
  mmfAllocBefore: number;
  onMmfAllocBeforeChange: (value: number) => void;

  equityAllocAfter: number;
  onEquityAllocAfterChange: (value: number) => void;
  bondAllocAfter: number;
  onBondAllocAfterChange: (value: number) => void;
  mmfAllocAfter: number;
  onMmfAllocAfterChange: (value: number) => void;
}

export default function CrashYearPanel({
  title,
  portfolioValue,
  onPortfolioValueChange,

  equityAllocBefore,
  onEquityAllocBeforeChange,
  bondAllocBefore,
  onBondAllocBeforeChange,
  mmfAllocBefore,
  onMmfAllocBeforeChange,

  equityAllocAfter,
  onEquityAllocAfterChange,
  bondAllocAfter,
  onBondAllocAfterChange,
  mmfAllocAfter,
  onMmfAllocAfterChange
}: Props) {

  const formatNumber = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const toPercentFromValue = (value: number, portfolioValue: number) =>
    portfolioValue > 0 ? (value / portfolioValue) * 100 : 0;

  const toValueFromPercent = (pct: number, portfolioValue: number) =>
    (portfolioValue * pct) / 100;

  const handlePortfolioInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    const num = Number(raw);
    if (!isNaN(num)) onPortfolioValueChange(num);
  };

  const handlePercentInput = (rawValue: string, onChange: (value: number) => void) => {
    const num = Number(rawValue);
    if (!Number.isNaN(num)) {
      onChange(num);
    }
  };

  const handleValueInput = (rawValue: string, portfolioValue: number, onPercentChange: (value: number) => void) => {
    const num = Number(rawValue.replace(/,/g, ""));
    if (!Number.isNaN(num)) {
      onPercentChange(toPercentFromValue(num, portfolioValue));
    }
  };

  const sumBefore = equityAllocBefore + bondAllocBefore + mmfAllocBefore;
  const sumAfter = equityAllocAfter + bondAllocAfter + mmfAllocAfter;

  const beforeInvalid = Math.round(sumBefore) !== 100;
  const afterInvalid = Math.round(sumAfter) !== 100;

  return (
    <div className="panel-container">

      {/* TITLE */}
      <div className="panel-title-row">
        <h2 className="control-title" style={{ marginBottom: 0 }}>{title}</h2>
        <input
          className="panel-title-input"
          type="text"
          value={formatNumber(portfolioValue)}
          onChange={handlePortfolioInput}
        />
      </div>

      {/* ALLOCATIONS BEFORE CRASH */}
      <h3 style={{ fontSize: "13px", margin: "6px 0" }}>Allocation Before Crash</h3>
      <div style={{ overflowX: "auto", marginBottom: "10px" }}>
        <table className="growth-table" style={{ width: "auto", minWidth: 0 }}>
          <colgroup>
            <col style={{ width: 92 }} />
            <col style={{ width: 84 }} />
            <col style={{ width: 108 }} />
          </colgroup>
          <thead>
            <tr>
              <th>Asset</th>
              <th>%</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Equities</td>
              <td style={{ textAlign: "left" }}><input className="compact-percent-input" type="number" value={equityAllocBefore} onChange={(e) => handlePercentInput(e.target.value, onEquityAllocBeforeChange)} /></td>
              <td><input className="compact-value-input" type="text" value={formatNumber(toValueFromPercent(equityAllocBefore, portfolioValue))} onChange={(e) => handleValueInput(e.target.value, portfolioValue, onEquityAllocBeforeChange)} /></td>
            </tr>
            <tr>
              <td>Bonds</td>
              <td style={{ textAlign: "left" }}><input className="compact-percent-input" type="number" value={bondAllocBefore} onChange={(e) => handlePercentInput(e.target.value, onBondAllocBeforeChange)} /></td>
              <td><input className="compact-value-input" type="text" value={formatNumber(toValueFromPercent(bondAllocBefore, portfolioValue))} onChange={(e) => handleValueInput(e.target.value, portfolioValue, onBondAllocBeforeChange)} /></td>
            </tr>
            <tr>
              <td>MMF</td>
              <td style={{ textAlign: "left" }}><input className="compact-percent-input" type="number" value={mmfAllocBefore} onChange={(e) => handlePercentInput(e.target.value, onMmfAllocBeforeChange)} /></td>
              <td><input className="compact-value-input" type="text" value={formatNumber(toValueFromPercent(mmfAllocBefore, portfolioValue))} onChange={(e) => handleValueInput(e.target.value, portfolioValue, onMmfAllocBeforeChange)} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {beforeInvalid && (
        <div style={{ color: "#b91c1c", fontSize: "12px", marginBottom: "10px" }}>
          {`Before-crash allocation sums to ${sumBefore.toFixed(2)}%. It must sum to 100%.`}
        </div>
      )}

      {/* ALLOCATIONS AFTER CRASH (PERCENT ONLY) */}
      <h3 style={{ fontSize: "13px", margin: "6px 0" }}>Allocation After Crash (%)</h3>
      <div style={{ overflowX: "auto", marginBottom: "10px" }}>
        <table className="growth-table" style={{ width: "auto", minWidth: 0 }}>
          <colgroup>
            <col style={{ width: 92 }} />
            <col style={{ width: 84 }} />
          </colgroup>
          <thead>
            <tr>
              <th>Asset</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Equities</td>
              <td style={{ textAlign: "left" }}><input className="compact-percent-input" type="number" value={equityAllocAfter} onChange={(e) => handlePercentInput(e.target.value, onEquityAllocAfterChange)} /></td>
            </tr>
            <tr>
              <td>Bonds</td>
              <td style={{ textAlign: "left" }}><input className="compact-percent-input" type="number" value={bondAllocAfter} onChange={(e) => handlePercentInput(e.target.value, onBondAllocAfterChange)} /></td>
            </tr>
            <tr>
              <td>MMF</td>
              <td style={{ textAlign: "left" }}><input className="compact-percent-input" type="number" value={mmfAllocAfter} onChange={(e) => handlePercentInput(e.target.value, onMmfAllocAfterChange)} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {afterInvalid && (
        <div style={{ color: "#b91c1c", fontSize: "12px", marginBottom: "10px" }}>
          {`After-crash allocation sums to ${sumAfter.toFixed(2)}%. It must sum to 100%.`}
        </div>
      )}

    </div>
  );
}
