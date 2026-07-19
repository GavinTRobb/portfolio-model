import { useState } from "react";

export interface PortfolioSettings {
  portfolio: number;
  equity: number;
  bonds: number;
  mmf: number;
  crashYear: number;

  equityAllocS1: number;
  bondAllocS1: number;
  mmfAllocS1: number;
  equityAllocS2: number;
  bondAllocS2: number;
  mmfAllocS2: number;
  equityAllocPostCrash: number;
  bondAllocPostCrash: number;
  mmfAllocPostCrash: number;
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

  // Allocations
  const [allocEquityS1, setAllocEquityS1] = useState<number>(10);
  const [allocBondsS1, setAllocBondsS1] = useState<number>(20);
  const [allocMMFS1, setAllocMMFS1] = useState<number>(70);

  const [allocEquityS2, setAllocEquityS2] = useState<number>(50);
  const [allocBondsS2, setAllocBondsS2] = useState<number>(40);
  const [allocMMFS2, setAllocMMFS2] = useState<number>(10);

  const [allocEquityPostCrash, setAllocEquityPostCrash] = useState<number>(70);
  const [allocBondsPostCrash, setAllocBondsPostCrash] = useState<number>(20);
  const [allocMMFPostCrash, setAllocMMFPostCrash] = useState<number>(10);

  const applyChanges = () => {
    onApply({
      portfolio,
      crashYear,

      equity: draftEquity,
      bonds: draftBonds,
      mmf: draftMMF,

      equityAllocS1: allocEquityS1,
      bondAllocS1: allocBondsS1,
      mmfAllocS1: allocMMFS1,
      equityAllocS2: allocEquityS2,
      bondAllocS2: allocBondsS2,
      mmfAllocS2: allocMMFS2,
      equityAllocPostCrash: allocEquityPostCrash,
      bondAllocPostCrash: allocBondsPostCrash,
      mmfAllocPostCrash: allocMMFPostCrash
    });
  };

  const sumS1 = allocEquityS1 + allocBondsS1 + allocMMFS1;
  const sumS2 = allocEquityS2 + allocBondsS2 + allocMMFS2;
  const sumPost = allocEquityPostCrash + allocBondsPostCrash + allocMMFPostCrash;

  const isS1Invalid = sumS1 !== 100;
  const isS2Invalid = sumS2 !== 100;
  const isPostInvalid = sumPost !== 100;

  return (
    <div className="panel-container">
      <h2 className="control-title">Growth Rates & Allocations</h2>

      {/* HEADER ROW */}
      <div className="control-row" style={{ fontWeight: 600, marginBottom: 10, fontSize: "12px" }}>
        <label style={{ width: 80, textAlign: "left" }}>Asset</label>
        <label style={{ width: 70, textAlign: "center" }}>Growth (%)</label>
        <label style={{ width: 80, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
          Alloc. S1
          {isS1Invalid && (
            <span
              title={`Scenario 1 allocations before crash sum to ${sumS1}%. They must sum to 100%.`}
              style={{ color: "#ef4444", cursor: "help", fontSize: "14px" }}
            >
              ⚠️
            </span>
          )}
        </label>
        <label style={{ width: 80, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
          Alloc. S2
          {isS2Invalid && (
            <span
              title={`Scenario 2 allocations before crash sum to ${sumS2}%. They must sum to 100%.`}
              style={{ color: "#ef4444", cursor: "help", fontSize: "14px" }}
            >
              ⚠️
            </span>
          )}
        </label>
        <label style={{ width: 80, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
          Alloc. After
          {isPostInvalid && (
            <span
              title={`Allocations after crash sum to ${sumPost}%. They must sum to 100%.`}
              style={{ color: "#ef4444", cursor: "help", fontSize: "14px" }}
            >
              ⚠️
            </span>
          )}
        </label>
      </div>

      {/* EQUITY */}
      <div className="control-row">
        <label style={{ width: 80, fontSize: "13px" }}>Equities</label>

        <input
          type="number"
          step="0.1"
          value={draftEquity}
          onChange={(e) => setDraftEquity(Number(e.target.value))}
          style={{ width: 70 }}
        />

        <input
          type="number"
          step="1"
          value={allocEquityS1}
          onChange={(e) => setAllocEquityS1(Number(e.target.value))}
          style={{ width: 80, backgroundColor: isS1Invalid ? "#fee2e2" : undefined }}
        />

        <input
          type="number"
          step="1"
          value={allocEquityS2}
          onChange={(e) => setAllocEquityS2(Number(e.target.value))}
          style={{ width: 80, backgroundColor: isS2Invalid ? "#fee2e2" : undefined }}
        />

        <input
          type="number"
          step="1"
          value={allocEquityPostCrash}
          onChange={(e) => setAllocEquityPostCrash(Number(e.target.value))}
          style={{ width: 80, backgroundColor: isPostInvalid ? "#fee2e2" : undefined }}
        />
      </div>

      {/* BONDS */}
      <div className="control-row">
        <label style={{ width: 80, fontSize: "13px" }}>Bonds</label>

        <input
          type="number"
          step="0.1"
          value={draftBonds}
          onChange={(e) => setDraftBonds(Number(e.target.value))}
          style={{ width: 70 }}
        />

        <input
          type="number"
          step="1"
          value={allocBondsS1}
          onChange={(e) => setAllocBondsS1(Number(e.target.value))}
          style={{ width: 80, backgroundColor: isS1Invalid ? "#fee2e2" : undefined }}
        />

        <input
          type="number"
          step="1"
          value={allocBondsS2}
          onChange={(e) => setAllocBondsS2(Number(e.target.value))}
          style={{ width: 80, backgroundColor: isS2Invalid ? "#fee2e2" : undefined }}
        />

        <input
          type="number"
          step="1"
          value={allocBondsPostCrash}
          onChange={(e) => setAllocBondsPostCrash(Number(e.target.value))}
          style={{ width: 80, backgroundColor: isPostInvalid ? "#fee2e2" : undefined }}
        />
      </div>

      {/* MMF */}
      <div className="control-row">
        <label style={{ width: 80, fontSize: "13px" }}>MMF</label>

        <input
          type="number"
          step="0.1"
          value={draftMMF}
          onChange={(e) => setDraftMMF(Number(e.target.value))}
          style={{ width: 70 }}
        />

        <input
          type="number"
          step="1"
          value={allocMMFS1}
          onChange={(e) => setAllocMMFS1(Number(e.target.value))}
          style={{ width: 80, backgroundColor: isS1Invalid ? "#fee2e2" : undefined }}
        />

        <input
          type="number"
          step="1"
          value={allocMMFS2}
          onChange={(e) => setAllocMMFS2(Number(e.target.value))}
          style={{ width: 80, backgroundColor: isS2Invalid ? "#fee2e2" : undefined }}
        />

        <input
          type="number"
          step="1"
          value={allocMMFPostCrash}
          onChange={(e) => setAllocMMFPostCrash(Number(e.target.value))}
          style={{ width: 80, backgroundColor: isPostInvalid ? "#fee2e2" : undefined }}
        />
      </div>

      {/* APPLY BUTTON */}
      <div className="bottom-align">
        <button className="apply-button" onClick={applyChanges}>
          Apply Growth Rates
        </button>
      </div>
    </div>
  );
}
