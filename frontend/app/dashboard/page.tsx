import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutBtn from "@/components/LogoutBtn";
import DashboardSummaryCard from "@/components/DashboardSummaryCards";
import RecentTransactions from "@/components/RecentTransactions";
import BudgetOverview from "@/components/BudgetOverview";

async function getDashboardData(token: string) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [summaryRes, transactionsRes, budgetRes] = await Promise.all([
    fetch(`${baseURL}/api/transactions/summary?month=${currentMonth}`, {
      headers,
      cache: "no-store",
    }),
    fetch(`${baseURL}/api/transactions?limit=5&sort=date_desc`, {
      headers,
      cache: "no-store",
    }),
    fetch(`${baseURL}/api/budgets`, {
      headers,
      cache: "no-store",
    }),
  ]);

  const [summary, transactions, budgets] = await Promise.all([
    summaryRes.json(),
    transactionsRes.json(),
    budgetRes.json(),
  ]);

  return {
    summary: summary.data,
    transactions: transactions.data,
    budgets: budgets.data,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const token = (session as any)?.backendToken;
  if (!token) {
    return (
      <div className="p-6 text-red-500">Session invalid, please re-login</div>
    );
  }

  const { summary, transactions, budgets } = await getDashboardData(token);

  const budgetNearLimit = budgets.filter(
    (b: any) => b.isWarning || b.isExceeded,
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Selamat Datang, {session.user?.name}!</p>
          <p>Email: {session.user?.email}</p>
        </div>
        <LogoutBtn />
      </div>
      <DashboardSummaryCard summary={summary} />

      <div>
        <RecentTransactions transactions={transactions} />
        <BudgetOverview budgets={budgetNearLimit} />
      </div>
    </div>
  );
}
