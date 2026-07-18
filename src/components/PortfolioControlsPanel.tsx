import { useState } from "react";

export interface PortfolioSettings {
  portfolio: number;
  equity: number;
  bonds: number;
  mmf: number;
  crashYear: number;

  equityAlloc: number;
  bondAlloc: number;
  mmfAlloc: number;
}

interface Props {
  onApply: (settings: PortfolioSettings) => void;
  portfolio: number;
  crashYear: number;
}

export default function PortfolioControlsPanel({ onApply, portfolio, crashYear }: Props) {
  // Growth rates
  const [draftEquity, setDraftEquity] = useState<number>(8.0);
  const [draftBonds, setDraftBonds] = useState<number>(3.5);
  const [draftMMF, setDraftMMF] = useState<number>(1.5);

  // NEW — Allocations
  const [allocEquity, setAllocEquity] = useState<number>(20);
  const [allocBonds, setAllocBonds] = useState<number>(40);
  const [allocMMF, setAllocMMF] = useState<number>(20);

  const applyChanges = () => {
    onApply({
      portfolio,
      crashYear,

      equity: draftEquity,
      bonds: draftBonds,
      mmf: draftMMF,

      equityAlloc: allocEquity,
      bondAlloc: allocBonds,
      mmfAlloc: allocMMF
    });
  };

  return (
    <div className="panel-container">
      <h2 className="control-title">Growth Rates</h2>

      {/* HEADER ROW */}
      <div className="control-row" style={{ fontWeight: 600 }}>
        <label style={{ width: 140 }}>Asset</label>
        <label style={{ width: 80 }}>Growth (%)</label>
        <label style={{ width: 100 }}>Allocation (%)</label>
      </div>

      {/* EQUITY */}
      <div className="control-row">
        <label>Equities</label>

        <input
          type="number"
          step="0.1"
          value={draftEquity}
          onChange={(e) => setDraftEquity(Number(e.target.value))}
          style={{ width: 80 }}
        />

        <input
          type="number"
          step="1"
          value={allocEquity}
          onChange={(e) => setAllocEquity(Number(e.target.value))}
          style={{ width: 100 }}
        />
      </div>

      {/* BONDS */}
      <div className="control-row">
        <label>Bonds</label>

        <input
          type="number"
          step="0.1"
          value={draftBonds}
          onChange={(e) => setDraftBonds(Number(e.target.value))}
          style={{ width: 80 }}
        />

        <input
          type="number"
          step="1"
          value={allocBonds}
          onChange={(e) => setAllocBonds(Number(e.target.value))}
          style={{ width: 100 }}
        />
      </div>

      {/* MMF */}
      <div className="control-row">
        <label>MMF</label>

        <input
          type="number"
          step="0.1"
          value={draftMMF}
          onChange={(e) => setDraftMMF(Number(e.target.value))}
          style={{ width: 80 }}
        />

        <input
          type="number"
          step="1"
          value={allocMMF}
          onChange={(e) => setAllocMMF(Number(e.target.value))}
          style={{ width: 100 }}
        />
      </div>

      {/* APPLY BUTTON */}
      <div className="bottom-align">
        <button className="apply-button" onClick={applyChanges}>
          Apply Changes
        </button>
      </div>
    </div>
  );
}
