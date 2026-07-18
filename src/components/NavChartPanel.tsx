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
    end: number;
  }[];
}

export default function NavChartPanel({ navRows }: Props) {
  return (
    <div className="panel-container">
      <h2 className="control-title">NAV Chart</h2>

      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={navRows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              tickFormatter={(v) =>
                v.toLocaleString("en-US", { maximumFractionDigits: 0 })
              }
            />
            <Tooltip
              formatter={(v: number) =>
                v.toLocaleString("en-US", { maximumFractionDigits: 0 })
              }
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
