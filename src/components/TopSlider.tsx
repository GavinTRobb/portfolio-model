import { useState } from "react";

interface Props {
  label: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export default function TopSlider({ label, min, max, step = 1, onChange }: Props) {
  const [value, setValue] = useState((min + max) / 2);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setValue(v);
    onChange(v);
  };

  return (
    <div style={{ padding: "10px" }}>
      <label style={{ fontWeight: 600 }}>{label}: {value}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        style={{ width: "100%" }}
      />
    </div>
  );
}
