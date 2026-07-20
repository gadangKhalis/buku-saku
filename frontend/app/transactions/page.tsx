"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import { Category } from "@/lib/types/category";
import { Transaction, TransactionFormData } from "@/lib/types/transaction";

const EMPTY_FORM: TransactionFormData = {
  categoryId: "",
  amount: "",
  currency: "IDR",
  type: "EXPENSE",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setIsLoading(true);
    setError(null);
    try {
      const [transactionRes, categoriesRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/categories"),
      ]);
      setTransactions(transactionRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      setError("Transaction loading failed. Try refresh the page");
    } finally {
      setIsLoading(false);
    }
  }
  async function ensureUsdRate() {
    if (usdRate !== null) return;
    try {
      const res = await api.get("/currency/rate");
      setUsdRate(res.data.data.rate);
    } catch {
      // if rate loaded fail, just skip the preview
    }
  }

  function openCreateForm() {
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id ?? "",
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(transaction: Transaction) {
    setEditingId(transaction.id);
    setFormData({
      categoryId: transaction.categoryId,
      amount: String(transaction.amount),
      currency: transaction.currency,
      type: transaction.type,
      description: transaction.description ?? "",
      date: transaction.date.split("T")[0],
    });
    setFormError(null);
    setIsFormOpen(true);
    if (transaction.currency === "USD") ensureUsdRate();
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormError(null);
  }

  function handleCurrencyChange(currency: "USD" | "IDR") {
    setFormData((prev) => ({ ...prev, currency }));
    if (currency === "USD") ensureUsdRate();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const payload = {
      categoryId: formData.categoryId,
      amount: Number(formData.amount),
      currency: formData.currency,
      type: formData.type,
      description: formData.description || undefined,
      date: formData.date,
    };

    try {
      if (editingId) {
        const res = await api.put(`/transactions/${editingId}`, payload);
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingId ? res.data.data : t)),
        );
      } else {
        const res = await api.post("/transactions", payload);
        setTransactions((prev) => [res.data.data, ...prev]);
      }
      closeForm();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Saving transaction failed. Try Again";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleDelete(id: string) {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setDeleteTargetId(null);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Delete transaction failed";
      alert(message);
      setDeleteTargetId(null);
    }
  }

  const previewAmountInIDR =
    formData.currency === "USD" && usdRate && Number(formData.amount) > 0
      ? Number(formData.amount) * usdRate
      : null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Transaction</h1>
        <Button onClick={openCreateForm} disabled={categories.length === 0}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {!isLoading && categories.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          You havent category yet. Make categories first in page {""}
          <a href="/categories" className="underline">
            Category
          </a>
          .
        </p>
      )}

      {/* FORM: CREATE / EDIT */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="border rounded-lg p-4 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {editingId ? "Edit Transaction" : "New Transaction"}
            </h2>
            <button type="button" onClick={closeForm}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              className="w-full border rounded-md p-2"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Total</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="w-full border rounded-md p-2"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  handleCurrencyChange(e.target.value as "USD" | "IDR")
                }
              >
                <option value={"IDR"}>IDR</option>
                <option value={"USD"}>USD</option>
              </select>
            </div>
          </div>
          {previewAmountInIDR !== null && (
            <p className="text-sm text-muted-foreground">
              = {formatRupiah(previewAmountInIDR)}
            </p>
          )}

          <div>
            <label className="text-sm font-medium mb-1 block">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "EXPENSE" }))
                }
                className={`flex-1 border rounded-md p-2 ${formData.type === "EXPENSE" ? "border-destructive bg-destructive/10" : "border-input"}`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "INCOME" }))
                }
                className={`flex-1 border rounded-md p-2 ${
                  formData.type === "INCOME"
                    ? "border-green-600 bg-green-50"
                    : "border-input"
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Description (optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full border rounded-md p-2"
              placeholder="Example: Lunch"
              maxLength={200}
            />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving" : "Save"}
          </Button>
        </form>
      )}

      {/* List States */}
      {isLoading && (
        <p className="text-muted-foreground text-sm">
          Loading Transactions ....
        </p>
      )}

      {!isLoading && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!isLoading && !error && transactions.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No transaction yet. Click add Transaction above to create ones
        </p>
      )}

      {!isLoading && !error && transactions.length > 0 && (
        <ul>
          {transactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center justify-between border rounded-md p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: transaction.category.color }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs"
                >
                  {transaction.category.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">
                    {transaction.description || transaction.category.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.category.name} ·{" "}
                    {new Date(transaction.date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <div>
                <span
                  className={`font-medium text-sm ${transaction.type === "INCOME" ? "text-green-600" : "test-destructive"}`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}{" "}
                  {formatRupiah(transaction.amountInIDR)}
                </span>
                <button onClick={() => openEditForm(transaction)}>
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => setDeleteTargetId(transaction.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Confirm Delete */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full space-y-4">
            <p>Are you sure to delete this transaction?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteTargetId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
