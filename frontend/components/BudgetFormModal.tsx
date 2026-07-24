"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface BudgetFormModalProps {
  budget: {
    id: string;
    categoryId: string;
    limitIDR: number;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BudgetFormModal({
  budget,
  onClose,
  onSuccess,
}: BudgetFormModalProps) {
  const isEditMode = budget !== null;

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? "");
  const [limitIDR, setLimitIDR] = useState(budget?.limitIDR.toString() ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data);
      } catch (err) {
        toast.error("Failed to load category list");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const limitNumber = Number(limitIDR);
    if (!limitNumber || limitNumber <= 0) {
      toast.error("Limit must be positive");
      return;
    }

    if (!isEditMode && !categoryId) {
      toast.error("Choose category first");
      return;
    }

    try {
      setSubmitting(true);

      if (isEditMode) {
        const res = await api.put(`/budgets/${budget.id}`, {
          limitIDR: limitNumber,
        });
        console.log("PUT response:", res); // ← tambah ini
        toast.success("Budget updated successfully");
      } else {
        const res = await api.post("/budgets", {
          categoryId,
          limitIDR: limitNumber,
        });
        console.log("POST response:", res); // ← tambah ini
        toast.success("Budget berhasil dibuat");
      }

      onSuccess();
    } catch (err: any) {
      console.log("Error object:", err); // ← tambah ini

      if (err.response?.status === 409) {
        toast.error("This category already have active busget");
      } else {
        toast.error("Failed save budget");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold">
          {isEditMode ? "Edit Budget" : "Set New Budget"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isEditMode}
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
            >
              <option value="">-- Choose Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Limit (IDR)
            </label>
            <input
              type="number"
              value={limitIDR}
              onChange={(e) => setLimitIDR(e.target.value)}
              placeholder="Ex: 10000000"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {submitting ? "Saving ...." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
