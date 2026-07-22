"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Pencil,
  Plus,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Category } from "@/lib/types/category";
import { Transaction, TransactionFormData } from "@/lib/types/transaction";
import { toast } from "sonner";

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

function useFilters() {
  const searchParams = useSearchParams();

  return {
    month: searchParams.get("month") ?? "",
    categoryId: searchParams.get("categoryId") ?? "",
    type: searchParams.get("type") ?? "",
    search: searchParams.get("search") ?? "",
    sort: searchParams.get("sort") ?? "date_desc",
    minAmount: searchParams.get("minAmount") ?? "",
    maxAmount: searchParams.get("maxAmount") ?? "",
    page: searchParams.get("page") ?? "1",
  };
}

function useUpdateFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      if (!("page" in updates)) {
        params.set("page", "1");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );
}

export default function TransactionsPage() {
  const filters = useFilters();
  const updateFilters = useUpdateFilters();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [minAmountInput, setMinAmountInput] = useState(filters.minAmount);
  const [maxAmountInput, setMaxAmountInput] = useState(filters.maxAmount);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [
    filters.month,
    filters.categoryId,
    filters.type,
    filters.search,
    filters.sort,
    filters.minAmount,
    filters.maxAmount,
    filters.page,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: searchInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ minAmount: minAmountInput, maxAmount: maxAmountInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [minAmountInput, maxAmountInput]);

  async function fetchCategories() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data);
    } catch (err) {
      toast.error("Load Category Failed");
    }
  }

  async function fetchTransactions() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/transactions", {
        params: {
          ...(filters.month && { month: filters.month }),
          ...(filters.categoryId && { categoryId: filters.categoryId }),
          ...(filters.type && { type: filters.type }),
          ...(filters.search && { search: filters.search }),
          ...(filters.minAmount && { minAmount: filters.minAmount }),
          ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
          sort: filters.sort,
          page: filters.page,
          limit: 10,
        },
      });
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError("Failed load Transactions. Refresh the page");
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
        toast.success("Transaction updated successfully");
      } else {
        const res = await api.post("/transactions", payload);
        setTransactions((prev) => [res.data.data, ...prev]);
        toast.success("Transaction added successfully");
      }
      closeForm();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Saving transaction failed. Try Again";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleDelete(id: string) {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setDeleteTargetId(null);
      toast.success("Trasaction deleted");
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Delete transaction failed";
      toast.error(message);
      setDeleteTargetId(null);
    }
  }

  const previewAmountInIDR =
    formData.currency === "USD" && usdRate && Number(formData.amount) > 0
      ? Number(formData.amount) * usdRate
      : null;

  function handleSearchChange(value: string) {
    setSearchInput(value);
  }

  function handleAmountChange(field: "minAmount" | "maxAmount", value: string) {
    if (field === "minAmount") setMinAmountInput(value);
    else setMaxAmountInput(value);
  }

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

      {/* FILTER BAR */}
      <div className="border rounded-lg p-4 mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              defaultValue={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Find Description ..."
              className="w-full border rounded-md p-2 pl-8"
            />
          </div>

          <select
            value={filters.sort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="border rounded-md p-2"
          >
            <option value="date_desc">Newest</option>
            <option value="date_asc">Oldest</option>
            <option value="amount_desc">Biggest</option>
            <option value="amount_asc">Smallest</option>
          </select>
        </div>

        <div>
          <input
            type="month"
            value={filters.month}
            onChange={(e) => updateFilters({ month: e.target.value })}
            className="border rounded-md p-2"
          />

          <select
            value={filters.categoryId}
            onChange={(e) => updateFilters({ categoryId: e.target.value })}
            className="border rounded-md p-2"
          >
            <option value="">All Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="flex border rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => updateFilters({ type: "" })}
              className={`px-3 py-2 text-sm ${filters.type === "" ? "bg-primary text-primary-foreground" : ""}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ type: "INCOME" })}
              className={`px-3 py-2 text-sm ${filters.type === "INCOME" ? "bg-primary text-primary-foreground" : ""}`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ type: "EXPENSE" })}
              className={`px-3 py-2 text-sm ${filters.type === "EXPENSE" ? "bg-primary text-primary-foreground" : ""}`}
            >
              Expense
            </button>
          </div>

          <input
            type="number"
            placeholder="Min Rp"
            defaultValue={filters.minAmount}
            onChange={(e) => handleAmountChange("minAmount", e.target.value)}
            className="border rounded-md p-2 w-28"
          />
          <input
            type="number"
            placeholder="Max Rp"
            defaultValue={filters.maxAmount}
            onChange={(e) => handleAmountChange("maxAmount", e.target.value)}
            className="border rounded-md p-2 w-28"
          />
        </div>
      </div>

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
                  className={`font-medium text-sm ${transaction.type === "INCOME" ? "text-green-600" : "text-destructive"}`}
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

      {!isLoading && !error && transactions.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} from {pagination.totalPages} (
            {pagination.totalCount} transaction)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => updateFilters({ page: pagination.page - 1 })}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => updateFilters({ page: pagination.page + 1 })}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
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
