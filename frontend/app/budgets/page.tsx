"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../../lib/api";
import BudgetCard from "../../components/BudgetCard";
import BudgetFormModal from "../../components/BudgetFormModal";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

interface Budget {
  id: string;
  categoryId: string;
  limitIDR: number;
  totalSpent: number;
  usagePercent: number;
  remaining: number;
  isWarning: boolean;
  isExceeded: boolean;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/budgets");
      setBudgets(res.data.data);
    } catch (err) {
      setError("Failed to load budget data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure delete this budgets?")) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success("Budget deleted");
      fetchBudgets();
    } catch (err) {
      toast.error("Failed delete this budget");
    }
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };

  if (loading) {
    return <div className="p-6 text-gray-400">Loading budget data.....</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budget</h1>
        <Button onClick={openCreateModal}>+ Set Budget</Button>
      </div>

      {/* LIST STATES */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="text-4xl">⚠️</div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchBudgets}
            className="text-sm text-primary underline underline-offset-4"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && budgets.length === 0 && (
        <EmptyState
          icon="🎯"
          title="No budget yet"
          description="Set budget per Category to start tracking your expense."
          actionLabel="Set Budget"
          onAction={openCreateModal}
        />
      )}

      {!loading && !error && budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => openEditModal(budget)}
              onDelete={() => handleDelete(budget.id)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <BudgetFormModal
          budget={editingBudget}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchBudgets();
          }}
        />
      )}
    </div>
  );
}
