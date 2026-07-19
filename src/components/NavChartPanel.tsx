import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

interface Props {
  title?: string;
  navRows: {
    year: number;
    end?: number;
    endValue?: number;
    growthRate?: number;
    crashApplied?: boolean;
    drawdownApplied?: boolean;
    eqEndValue?: number;
    bdEndValue?: number;
    mmfEndValue?: number;
  }[];
  age: number;
}

export default function NavChartPanel({ title = "NAV Chart", navRows, age }: Props) {
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

  const chartData = useMemo(() => {
    return navRows.map((row) => {
      const endValue = row.endValue ?? row.end ?? 0;
      const eqValue = row.eqEndValue ?? 0;
      const bdValue = row.bdEndValue ?? 0;
      const mmfValue = row.mmfEndValue ?? 0;
      return {
        year: row.year,
        end: scaleValue(Math.max(0, endValue)),
        eq: scaleValue(Math.max(0, eqValue)),
        bd: scaleValue(Math.max(0, bdValue)),
        mmf: scaleValue(Math.max(0, mmfValue))
      };
    });
  }, [navRows, scale]);

  return (
    <div className="panel-container">
      <h2 className="control-title">{title}</h2>

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
          <BarChart data={chartData} margin={{ top: 24, right: 8, left: 2, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tickMargin={4} />
            <YAxis tickFormatter={formatTick} />
            <Tooltip
              formatter={(value: number) => formatTick(value)}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend />
            <Bar dataKey="eq" stackId="a" fill="#4f46e5" />
            <Bar dataKey="bd" stackId="a" fill="#10b981" />
            <Bar dataKey="mmf" stackId="a" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
