interface Budget {
  id: string;
  usagePercent: number;
  isWarning: boolean;
  isExceeded: boolean;
  category: {
    name: string;
  };
}

interface BudgetOverviewProps {
  budgets: Budget[];
}

function getStatusColor(budget: Budget): string {
  if (budget.isExceeded) return "text-red-600";
  if (budget.isWarning) return "text-yellow-600";
  return "text-gray-600";
}

export default function BudgetOverview({ budgets }: BudgetOverviewProps) {
  return (
    <div className="border rounded-xl p-4">
      <h2 className="font-semibold mb-3">Budget Limit is near</h2>

      {budgets.length === 0 ? (
        <p className="text-sm text-gray-400">All budget is safe</p>
      ) : (
        <ul className="space-y-2">
          {budgets.map((budget) => (
            <li
              key={budget.id}
              className="flex justify-between items-center text-sm"
            >
              <span>{budget.category.name}</span>
              <span>
                {budget.usagePercent}%{" "}
                {budget.isExceeded ? "(Exceeded)" : "(Warning)"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
