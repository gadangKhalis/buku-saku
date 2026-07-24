"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../../lib/api";
import BudgetCard from "../../components/BudgetCard";
import BudgetFormModal from "../../components/BudgetFormModal";

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
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Set Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <p>No budget set yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {" "}
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
