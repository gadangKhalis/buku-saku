"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
interface MonthlyData {
  month: string;
  total: number;
}

interface BarChartMonthlyProps {
  data: MonthlyData[];
}

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border rounded-lg shadow-md p-3">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-red-600">{formatIDR(payload[0].value)}</p>
    </div>
  );
}

export default function BarChartMonthly({ data }: BarChartMonthlyProps) {
  return (
    <div className="border rounded-xl p-4">
      <h2 className="font-semibold mb-3">Expense last 6 months</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("id-ID", { notation: "compact" }).format(
                value,
              )
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" fill="#f87171" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
