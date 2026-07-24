interface Transaction {
  id: string;
  description: string;
  amountInIDR: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  category: {
    name: string;
    color: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  return (
    <div className="border rounded-xl p-4">
      <h2 className="font-semibold mb-3">Last Transactions</h2>

      {transactions.length === 0 ? (
        <p className="text-sm text-gray-400">No transaction yet.</p>
      ) : (
        <ul>
          {transactions.map((tx) => (
            <li>
              <div>
                <p className="font-medium">
                  {tx.description || tx.category.name}
                </p>
                <p className="text-gray-400">{tx.category.name}</p>
              </div>
              <span>
                {tx.type === "INCOME" ? "+" : "-"}
                {formatIDR(tx.amountInIDR)}
              </span>
            </li>
          ))}{" "}
        </ul>
      )}
    </div>
  );
}
