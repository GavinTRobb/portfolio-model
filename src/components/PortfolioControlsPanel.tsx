import { useState } from "react";

export interface PortfolioSettings {
  portfolio: number;
  equity: number;
  bonds: number;
  mmf: number;
}

interface Props {
  onApply: (settings: PortfolioSettings) => void;
}

export default function PortfolioControls({ onApply }: Props) {
  const [draftPortfolio, setDraftPortfolio] = useState<number>(3500000);
  const [draftEquity, setDraftEquity] = useState<number>(8.0);
  const [draftBonds, setDraftBonds] = useState<number>(3.5);
  const [draftMMF, setDraftMMF] = useState<number>(1.5);

  const applyChanges = () => {
    onApply({
      portfolio: draftPortfolio,
      equity: draftEquity,
      bonds: draftBonds,
      mmf: draftMMF,
    });
  };

  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="control-panel">
      <h2 className="control-title">Portfolio Settings</h2>

      <div className="control-row">
        <label>Starting Portfolio Value</label>
        <input
          type="text"
          value={formatNumber(draftPortfolio)}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, "");
            const num = Number(raw);
            if (!isNaN(num)) setDraftPortfolio(num);
          }}
        />
      </div>

      <div className="control-row">
        <label>Equities Growth Rate</label>
        <input
          type="number"
          step="0.1"
          value={draftEquity}
          onChange={(e) => setDraftEquity(Number(e.target.value))}
        />
        <span className="percent">%</span>
      </div>

      <div className="control-row">
        <label>Bonds Growth Rate</label>
        <input
          type="number"
          step="0.1"
          value={draftBonds}
          onChange={(e) => setDraftBonds(Number(e.target.value))}
        />
        <span className="percent">%</span>
      </div>

      <div className="control-row">
        <label>MMF Growth Rate</label>
        <input
          type="number"
          step="0.1"
          value={draftMMF}
          onChange={(e) => setDraftMMF(Number(e.target.value))}
        />
        <span className="percent">%</span>
      </div>

      <button className="apply-button" onClick={applyChanges}>
        Apply Changes
      </button>
    </div>
  );
}
