"use client";

import { Pencil, Trash2 } from "lucide-react";

interface BudgetCardProps {
  budget: {
    id: string;
    limitIDR: number;
    totalSpent: number;
    usagePercent: number;
    remaining: number;
    isWarning: boolean;
    isExceeded: boolean;
    category: {
      name: string;
      icon: string;
      color: string;
    };
  };
  onEdit: () => void;
  onDelete: () => void;
}

function getBarColor(usagePercent: number): string {
  if (usagePercent >= 100) return "bg-red-500";
  if (usagePercent >= 80) return "bg-yellow-500";
  return "bg-green-500";
}

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BudgetCard({
  budget,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const {
    category,
    usagePercent,
    totalSpent,
    remaining,
    isWarning,
    isExceeded,
  } = budget;

  const displayPercent = Math.min(usagePercent, 100);

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm">
            {/* Icon Render */}
          </span>
          <h3 className="font-semibold">{category.name}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-blue-500"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          style={{ width: `${displayPercent}%` }}
          className={`h-full ${getBarColor(usagePercent)} transition-all`}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>
          {formatIDR(totalSpent)} / {formatIDR(budget.limitIDR)}
        </span>
        <span>{usagePercent}%</span>
      </div>

      <p className="text-sm">
        Remaining: <span className="font-medium">{formatIDR(remaining)}</span>
      </p>

      {isExceeded && (
        <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
          Exceeded!
        </span>
      )}
      {!isExceeded && isWarning && (
        <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
          Warning!
        </span>
      )}
    </div>
  );
}
