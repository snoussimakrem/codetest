"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
const demoHistory = [
  { month: "Jan", value: 250000 },
  { month: "Feb", value: 256000 },
  { month: "Mar", value: 268000 },
  { month: "Apr", value: 261000 },
  { month: "May", value: 279000 },
  { month: "Jun", value: 288000 },
  { month: "Jul", value: 300000 },
];
export function PortfolioChart({ value = 300000 }: { value?: number }) {
  const history = demoHistory.map((p) => ({
    ...p,
    value: Math.round((p.value / 300000) * value),
  }));
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={history}
          margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef825b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef825b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#ffffff08" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 9, fill: "#a19b8e" }}
            axisLine={false}
            tickLine={false}
            dy={12}
          />
          <YAxis
            tickFormatter={(v) => "$" + v / 1000 + "K"}
            tick={{ fontSize: 8, fill: "#a19b8e" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1d1e20",
              border: "1px solid #ffffff20",
              borderRadius: 8,
              fontSize: 11,
            }}
            formatter={(v) => [
              "$" + Number(v).toLocaleString(),
              "Simulated value",
            ]}
          />
          <Area
            dataKey="value"
            type="monotone"
            stroke="#f0a276"
            strokeWidth={2}
            fill="url(#chartFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function DistributionChart({ holdings }: { holdings: any[] }) {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={holdings.map((h) => ({
              name: h.startup.name,
              value: h.invested,
              color: h.startup.color,
            }))}
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            {holdings.map((h, i) => (
              <Cell key={i} fill={h.startup.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1d1e20",
              border: "1px solid #ffffff20",
              borderRadius: 8,
              fontSize: 10,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
