import { useEffect, useState } from "react";

export interface PortfolioSettings {
  equityS1: number;
  bondsS1: number;
  mmfS1: number;
  equityS2: number;
  bondsS2: number;
  mmfS2: number;
}

interface Props {
  equityRateS1: number;
  bondRateS1: number;
  mmfRateS1: number;
  equityRateS2: number;
  bondRateS2: number;
  mmfRateS2: number;
  applyToBothScenarios: boolean;
  onApply: (settings: PortfolioSettings) => void;
}

export default function PortfolioControlsPanel({
  equityRateS1,
  bondRateS1,
  mmfRateS1,
  equityRateS2,
  bondRateS2,
  mmfRateS2,
  applyToBothScenarios,
  onApply
}: Props) {
  const [draftEquityS1, setDraftEquityS1] = useState<number>(equityRateS1);
  const [draftBondsS1, setDraftBondsS1] = useState<number>(bondRateS1);
  const [draftMMFS1, setDraftMMFS1] = useState<number>(mmfRateS1);
  const [draftEquityS2, setDraftEquityS2] = useState<number>(equityRateS2);
  const [draftBondsS2, setDraftBondsS2] = useState<number>(bondRateS2);
  const [draftMMFS2, setDraftMMFS2] = useState<number>(mmfRateS2);

  useEffect(() => {
    setDraftEquityS1(equityRateS1);
    setDraftBondsS1(bondRateS1);
    setDraftMMFS1(mmfRateS1);
    setDraftEquityS2(equityRateS2);
    setDraftBondsS2(bondRateS2);
    setDraftMMFS2(mmfRateS2);
  }, [equityRateS1, bondRateS1, mmfRateS1, equityRateS2, bondRateS2, mmfRateS2]);

  const handleRateChange = (
    scenario: "s1" | "s2",
    asset: "equity" | "bonds" | "mmf",
    rawValue: string
  ) => {
    const value = Number(rawValue);
    if (Number.isNaN(value)) {
      return;
    }

    const applyToScenario = (targetScenario: "s1" | "s2") => {
      if (asset === "equity") {
        targetScenario === "s1" ? setDraftEquityS1(value) : setDraftEquityS2(value);
      } else if (asset === "bonds") {
        targetScenario === "s1" ? setDraftBondsS1(value) : setDraftBondsS2(value);
      } else {
        targetScenario === "s1" ? setDraftMMFS1(value) : setDraftMMFS2(value);
      }
    };

    applyToScenario(scenario);
    if (applyToBothScenarios) {
      applyToScenario(scenario === "s1" ? "s2" : "s1");
    }
  };

  const applyChanges = () => {
    onApply({
      equityS1: draftEquityS1,
      bondsS1: draftBondsS1,
      mmfS1: draftMMFS1,
      equityS2: draftEquityS2,
      bondsS2: draftBondsS2,
      mmfS2: draftMMFS2
    });
  };

  return (
    <div className="panel-container">
      <h2 className="control-title">Growth Rates</h2>

      <div style={{ overflowX: "auto", marginBottom: "10px" }}>
        <table className="growth-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Scenario 1</th>
              <th>Scenario 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Equities</td>
              <td>
                <input
                  className="compact-percent-input"
                  type="number"
                  step="0.1"
                  value={draftEquityS1}
                  onChange={(e) => handleRateChange("s1", "equity", e.target.value)}
                />
              </td>
              <td>
                <input
                  className="compact-percent-input"
                  type="number"
                  step="0.1"
                  value={draftEquityS2}
                  onChange={(e) => handleRateChange("s2", "equity", e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Bonds</td>
              <td>
                <input
                  className="compact-percent-input"
                  type="number"
                  step="0.1"
                  value={draftBondsS1}
                  onChange={(e) => handleRateChange("s1", "bonds", e.target.value)}
                />
              </td>
              <td>
                <input
                  className="compact-percent-input"
                  type="number"
                  step="0.1"
                  value={draftBondsS2}
                  onChange={(e) => handleRateChange("s2", "bonds", e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>MMF</td>
              <td>
                <input
                  className="compact-percent-input"
                  type="number"
                  step="0.1"
                  value={draftMMFS1}
                  onChange={(e) => handleRateChange("s1", "mmf", e.target.value)}
                />
              </td>
              <td>
                <input
                  className="compact-percent-input"
                  type="number"
                  step="0.1"
                  value={draftMMFS2}
                  onChange={(e) => handleRateChange("s2", "mmf", e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
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
