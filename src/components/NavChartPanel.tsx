import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

interface Props {
  navRows: {
    year: number;
    end?: number;
    endValue?: number;
  }[];
  age: number;
}

export default function NavChartPanel({ navRows, age }: Props) {
  const [scale, setScale] = useState<"actual" | "k" | "m">("m");

  const scaleValue = (v: number) => {
    if (scale === "k") return v / 1_000;
    if (scale === "m") return v / 1_000_000;
    return v;
  };

  const formatTick = (v: number) => {
    if (scale === "k") return `${v.toLocaleString()}k`;
    if (scale === "m") return `${v.toLocaleString()}m`;
    return v.toLocaleString();
  };

  const chartData = navRows.map((r) => ({
    year: r.year,
    end: scaleValue(r.endValue ?? r.end ?? 0)
  }));

  return (
    <div className="panel-container">
      <h2 className="control-title">NAV Chart</h2>

      {/* Dropdown */}
      <div style={{ marginBottom: "8px" }}>
        <select
          value={scale}
          onChange={(e) => setScale(e.target.value as any)}
          style={{ padding: "4px", fontSize: "14px" }}
        >
          <option value="actual">Actual</option>
          <option value="k">Thousands (k)</option>
          <option value="m">Millions (m)</option>
        </select>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          height: "100%",
          border: "1px solid #4b5563",
          borderRadius: 8,
          padding: 2,
          boxSizing: "border-box"
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 24, right: 8, left: 2, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tickMargin={4}
              padding={{ left: 4, right: 4 }}
              orientation="top"
              tickFormatter={(value) => `${age + (Number(value) - 2026)}`}
            />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tickMargin={4}
              padding={{ left: 4, right: 4 }}
            />
            <YAxis tickFormatter={formatTick} />
            <Tooltip
              formatter={(v: number) => formatTick(v)}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Line
              type="monotone"
              dataKey="end"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
