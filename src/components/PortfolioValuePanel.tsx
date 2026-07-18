import { useState } from "react";

interface Props {
  onChange: (value: number) => void;
}

export default function PortfolioValuePanel({ onChange }: Props) {
  const [value, setValue] = useState<number>(3500000);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    const num = Number(raw);
    if (!isNaN(num)) {
      setValue(num);
      onChange(num);
    }
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setValue(num);
    onChange(num);
  };

  const formatNumber = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* TOP AREA */}
      <div style={{ marginBottom: "16px" }}>
        <h2>Portfolio Value</h2>
        <input
          type="text"
          value={formatNumber(value)}
          onChange={handleInput}
          style={{ width: "100%" }}
        />
      </div>

      {/* BOTTOM AREA — SLIDER */}
      <div style={{ marginTop: "auto" }}>
        <label>Adjust Portfolio Value: {formatNumber(value)}</label>
        <input
          type="range"
          min={0}
          max={10000000}
          step={50000}
          value={value}
          onChange={handleSlider}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
