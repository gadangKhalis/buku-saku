"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
interface CategoryData {
  categoryId: string;
  name: string;
  color: string;
  total: number;
}

interface PieChartCategoryProps {
  data: CategoryData[];
}

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0];
  return (
    <div className="bg-white border rounded-lg shadow-md p-3">
      <p className="text-sm font-medium">{item.name}</p>
      <p className="text-sm">{formatIDR(item.value)}</p>
    </div>
  );
}

export default function PieChartCategory({ data }: PieChartCategoryProps) {
  if (data.length === 0) {
    return (
      <div className="border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Expense per Category</h2>
        <p className="text-sm text-gray-400">No Expense this month</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl p-4">
      <h2 className="font-semibold mb-3">Expense per Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => entry.name}
          >
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
