interface SummaryProps {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    month: string;
  };
}

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardSummaryCards({ summary }: SummaryProps) {
  const cards = [
    {
      label: "Total balance",
      value: summary.balance,
      color: summary.balance >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Income this month",
      value: summary.totalIncome,
      color: "text-blue-600",
    },
    {
      label: "Expense this month",
      value: summary.totalExpense,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>
            {formatIDR(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
